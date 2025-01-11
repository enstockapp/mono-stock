import { DataSource, DeepPartial, Repository } from 'typeorm'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import {
	areAllStringsDifferent,
	getPagination,
	HandleErrorAdapter,
	PaginatedResponse,
	PaginationDto,
	WhereQueryBuilder,
} from 'src/common'
import { Client } from 'src/client'

import { Variant, VariantOption } from '../entities'
import { CreateVariantDto, UpdateVariantDto } from '../dtos'
import { VariantOptionSummary, VariantSummary } from '../interfaces'
import { VariantOptionsService } from './variant-options.service'

@Injectable()
export class VariantsService {
	private readonly context: string = 'VariantsService'
	private readonly queryBuilderAlias: string = 'variant'

	constructor(
		@InjectRepository(Variant)
		private readonly variantsRepository: Repository<Variant>,
		private readonly variantOptionsService: VariantOptionsService,
		private readonly dataSource: DataSource,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create a Variant
	 * @param {CreateVariantDto} createVariantDto
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsService
	 */
	async create(
		createVariantDto: CreateVariantDto,
		client: Client,
	): Promise<VariantSummary> {
		const { name, options, ...restVariant } = createVariantDto

		try {
			// Verify if exist a variant with the same name
			await this.throwErrorIfExistName(name, client)

			// Verify all options names are differents
			const allNamesAreDifferents = areAllStringsDifferent(options)

			if (!allNamesAreDifferents)
				throw new BadRequestException(
					this.errorAdapter.getValidationError(
						'All options names must be differents',
					),
				)

			// Create variant
			const variant = this.variantsRepository.create({
				...restVariant,
				name,
				client,
			})
			await this.variantsRepository.save(variant)

			// Create variantOptions
			const variantOptionsCreations = []
			for (const option of options) {
				variantOptionsCreations.push(
					this.variantOptionsService.create(option, variant),
				)
			}
			const variantOptions = await Promise.all(variantOptionsCreations)

			// Transform to summary
			variant.variantOptions = variantOptions
			const variantSummary = this.transformToSummary(variant)

			return variantSummary
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all variants for a Client
	 * @param {PaginationDto} paginationDto
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary[]>}
	 * @memberof VariantsService
	 */
	async findAll(
		paginationDto: PaginationDto,
		client: Client,
	): Promise<PaginatedResponse> {
		const { limit, offset, page, size } = getPagination(paginationDto)
		try {
			const [variants, total] = await this.variantsRepository.findAndCount({
				where: { client: { id: client.id } },
				relations: ['variantOptions'],
				take: limit,
				skip: offset,
			})

			return {
				page,
				size,
				total,
				items: variants.map(variant => this.transformToSummary(variant)),
			}
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find a variant by term and client
	 * @param {string} term
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsService
	 */
	async findOne(term: string, client: Client): Promise<VariantSummary> {
		let variant: Variant | undefined = undefined
		const queryBuilder = this.variantsRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)

		const where: WhereQueryBuilder = !isNaN(Number(term))
			? {
					condition: `${this.queryBuilderAlias}.id = :id`,
					parameters: { id: +term },
				}
			: {
					condition: `UPPER(${this.queryBuilderAlias}.name) = :name`,
					parameters: { name: term.toUpperCase() },
				}

		variant = await queryBuilder
			.leftJoinAndSelect(
				`${this.queryBuilderAlias}.variantOptions`,
				'variantOption',
			)
			.where(where.condition, where.parameters)
			.andWhere('client_id = :clientId', { clientId: client.id })
			.getOne()

		if (variant) return this.transformToSummary(variant)

		throw new BadRequestException(
			this.errorAdapter.getNotFoundError(
				`Variant with id/name '${term}' not found`,
			),
		)
	}

	/**
	 * Update a variant by id and client
	 * @param {number} id
	 * @param {UpdateVariantDto} updateVariantDto
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsService
	 */
	async update(
		id: number,
		updateVariantDto: UpdateVariantDto,
		client: Client,
	): Promise<VariantSummary> {
		const { name, options: optionsDto } = updateVariantDto
		const updatePromises: Promise<any>[] = []

		try {
			// Verify if variant owns client
			const currentVariant = await this.findOne(id.toString(), client)

			if (!currentVariant.canEdit)
				throw new BadRequestException(
					this.errorAdapter.getNotFoundError(
						`Variant with id '${id}' cannot be modified`,
					),
				)

			// Verify if exist a variant with the same name
			if (name) await this.throwErrorIfExistName(name, client)

			// Verify optionsDto's id are valid
			if (optionsDto) {
				const currentOptions = currentVariant.variantOptions
				// Loop to verify
				for (const optionDto of optionsDto) {
					const { id, name } = optionDto
					let optionPromises: Promise<VariantOption>
					const variant = currentVariant as Variant
					// If exist
					if (currentOptions.find(currentOption => currentOption.id === id)) {
						// If has name update, else delete
						optionPromises =
							name?.length >= 1
								? this.variantOptionsService.update(id, name, variant)
								: this.variantOptionsService.delete(id, variant)
						// If NOT exist, create
					} else {
						optionPromises = this.variantOptionsService.create(name, variant)
					}
					updatePromises.push(optionPromises)
				}
			}

			// Add Update variant promise
			updatePromises.push(this._update(id, updateVariantDto))

			// Update all
			const promiseResult = await Promise.all(updatePromises)

			// Get updated variant
			const updatedVariant = promiseResult[promiseResult.length - 1]
			return updatedVariant
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Set Variant.canEdit to true by id
	 * @param {number} id
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsService
	 */
	async allowEdit(ids: number[]): Promise<VariantSummary[]> {
		const promises = []
		ids.forEach(id => this._update(id, { canEdit: true }))
		return await Promise.all(promises)
	}

	/**
	 * Set Variant.canEdit to false by id
	 * @param {number} id
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsService
	 */
	async blockEdit(ids: number[]): Promise<VariantSummary[]> {
		const promises = []
		ids.forEach(id => this._update(id, { canEdit: false }))
		return await Promise.all(promises)
	}

	/**
	 * Generic update Variant by id
	 * @private
	 * @param {number} id
	 * @param {DeepPartial<Variant>} entityLike
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsService
	 */
	private async _update(
		id: number,
		entityLike: DeepPartial<Variant>,
	): Promise<VariantSummary> {
		// preload: search for id and preload the fields in updateVariantDto
		const variant = await this.variantsRepository.preload({ ...entityLike, id })

		if (!variant)
			throw new BadRequestException(
				this.errorAdapter.getNotFoundError(`Variant with id '${id}' not found`),
			)

		// Create Query Runner
		const queryRunner = this.dataSource.createQueryRunner()
		await queryRunner.connect()
		await queryRunner.startTransaction()

		// Save variant
		await queryRunner.manager.save(variant)
		await queryRunner.commitTransaction()

		// Release Query Runner
		await queryRunner.release()

		return await this.transformToSummaryWithOptions(variant)
	}

	/**
	 * Delete Variant by id
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsService
	 */
	async delete(id: number, client: Client): Promise<VariantSummary> {
		try {
			const variant = (await this.findOne(id.toString(), client)) as Variant
			if (!variant.canEdit)
				throw new BadRequestException(
					this.errorAdapter.getNotFoundError(
						`Variant with id '${id}' cannot be modified`,
					),
				)

			//? Note:  Variant Options has onDelete: 'CASCADE'
			await this.variantsRepository.remove(variant)
			return variant
		} catch (error) {
			this.handleDBError(error)
		}
	}

	async validateIdsAndOptionsCombinations(
		optionsCombinationArray: number[][],
		client: Client,
	): Promise<VariantSummary[]> {
		try {
			//? Get variants with options for the client
			const { items: variants } = await this.findAll({ size: 1000 }, client)

			//? Validate variants is not empty
			if (variants.length <= 0)
				throw new BadRequestException(
					this.errorAdapter.getNotFoundError(
						`The client has no variants configured`,
					),
				)

			//? Validate options exist for client
			const validOptionsIds = variants
				.flatMap(variant => variant.variantOptions)
				.map(option => option.id)
			const allOptionsIds = optionsCombinationArray.flat()
			const allOptionsIdsSet = new Set(allOptionsIds)

			for (const optionId of allOptionsIdsSet) {
				if (!validOptionsIds.includes(optionId))
					throw new BadRequestException(
						this.errorAdapter.getNotFoundError(
							`Option id ${optionId} does not exist`,
						),
					)
			}

			//? Validate that the optionsIds can be together
			const { optionsSummaries, keyOptionValueVariant } =
				this.getAllOptionsFromVariants(variants)

			const allVariantsIds = optionsSummaries.map(option => option.variantId)
			const uniqueVariantsIds = Array.from(new Set(allVariantsIds))
			const uniqueVariantsSummaries = variants.filter(variant =>
				uniqueVariantsIds.includes(variant.id),
			)

			for (const combination of optionsCombinationArray) {
				//? Validate combination.length
				if (combination.length !== uniqueVariantsIds.length)
					throw new BadRequestException(
						this.errorAdapter.getValidationError(
							`All optionCombination must have length: ${uniqueVariantsIds.length}. But got length '${combination.length}' in [${combination.join(', ')}]`,
						),
					)
				// Array of variantsIds
				const variantsIdsInCombination = combination.map(
					option => keyOptionValueVariant[option],
				)
				const uniqueVariantsIdsForCombination = new Set(
					variantsIdsInCombination,
				)
				// If length/size is different, more than one options belongs the same variant
				if (
					variantsIdsInCombination.length !==
					uniqueVariantsIdsForCombination.size
				)
					throw new BadRequestException(
						this.errorAdapter.getValidationError(
							`More than one options belongs the same variant in combination [${combination.join(', ')}]`,
						),
					)
			}

			return uniqueVariantsSummaries
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * ChatGPT Code
	 * Explicación del código
	 * 1. Entrada:
	 * variants: Un array de objetos Variant, cada uno con una propiedad variantOptions, que es un array de VariantOption.
	 * 2. Lógica principal:
	 * La función generateCombinations trabaja de forma recursiva:
	 * Si el índice actual (index) llega al final del array variants, retorna un array con un único elemento vacío ([[]]).
	 * Toma las opciones (variantOptions) del Variant actual y las combina con las combinaciones generadas recursivamente para los siguientes Variant.
	 * 3. Combinación:
	 * Por cada VariantOption en el Variant actual, se crea una nueva combinación añadiéndolo a cada una de las combinaciones generadas para los Variant siguientes.
	 * 4. Resultado:
	 * Retorna un array de arrays donde cada sub-array es una combinación válida.
	 * @param {Variant[]} variants
	 * @return {*}
	 * @memberof VariantsService
	 */
	getAllPossibleOptionCombinations(variants: Variant[]) {
		if (variants.length === 0) return []

		// Helper para generar combinaciones recursivamente
		const generateCombinations = (index: number): VariantOption[][] => {
			if (index === variants.length) return [[]]

			const currentVariantOptions = variants[index].variantOptions
			const restCombinations = generateCombinations(index + 1)

			const combinations: VariantOption[][] = []
			for (const option of currentVariantOptions) {
				for (const restCombination of restCombinations) {
					combinations.push([option, ...restCombination])
				}
			}
			return combinations
		}

		return generateCombinations(0)
	}

	getAllOptionsFromVariants(variants: Variant[] | VariantSummary[]) {
		const optionsSummaries: VariantOptionSummary[] = []
		variants.forEach(variant =>
			optionsSummaries.push(...variant.variantOptions),
		)

		// Create object for simple validation. key = optionId / value = variantId
		const keyOptionValueVariant = {}
		for (const optionSummary of optionsSummaries) {
			keyOptionValueVariant[optionSummary.id] = optionSummary.variantId
		}

		return { optionsSummaries, keyOptionValueVariant }
	}

	async getValidOptionIdsForClient(client: Client): Promise<number[]> {
		const { items: variants } = await this.findAll({ size: 1000 }, client)
		const validOptionIds = variants
			.flatMap(variant => variant.variantOptions)
			.map(option => option.id)
		return validOptionIds
	}

	/**
	 * Transform Variant in VariantSummary
	 * @param {Variant} variant
	 * @return {*}  {VariantSummary}
	 * @memberof VariantsService
	 */
	transformToSummary(variant: Variant): VariantSummary {
		const { id, name, description, canEdit, client, variantOptions } = variant
		const variantOptionsExtend = variantOptions.map(
			vo => ({ ...vo, variant }) as VariantOption,
		)
		return {
			id,
			name,
			description,
			canEdit,
			clientId: client?.id,
			variantOptions:
				this.variantOptionsService.transformArrayToSummaries(
					variantOptionsExtend,
				),
		}
	}

	/**
	 * Transform Variant in VariantSummary and search current VariantOptions
	 * @param {Variant} variant
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsService
	 */
	async transformToSummaryWithOptions(
		variant: Variant,
	): Promise<VariantSummary> {
		const variantOptions = await this.variantOptionsService.findAll(variant)
		variant.variantOptions = variantOptions
		return this.transformToSummary(variant)
	}

	/**
	 * Throw error if exist Variant with same name
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<void>}
	 * @memberof VariantsService
	 */
	private async throwErrorIfExistName(
		name: string,
		client: Client,
	): Promise<void> {
		const isValidName = await this.isValidName(name, client)

		if (!isValidName)
			throw new BadRequestException(
				this.errorAdapter.getDuplicateKeyError(
					`Already exist a variant with name '${name}'`,
				),
			)
	}

	/**
	 * Verify it is a valid name
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<boolean>}
	 * @memberof VariantsService
	 */
	private async isValidName(name: string, client: Client): Promise<boolean> {
		const variant = await this.findOne(name, client).catch(() => {})
		return !variant
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
