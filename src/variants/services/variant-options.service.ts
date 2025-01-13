import { Repository, DataSource } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'

import {
	HandleErrorAdapter,
	WhereQueryBuilder,
	hasCommonElement,
} from 'src/common'

import { Variant, VariantOption } from '../entities'
import { VariantOptionSummary } from '../interfaces'

@Injectable()
export class VariantOptionsService {
	private readonly context: string = 'VariantOptionsService'
	private readonly queryBuilderAlias: string = 'variantOption'

	constructor(
		@InjectRepository(VariantOption)
		private readonly variantOptionsRepository: Repository<VariantOption>,
		private readonly dataSource: DataSource,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create a Variant Option
	 * @param {string} name
	 * @param {Variant} variant
	 * @return {*}  {Promise<VariantOption>}
	 * @memberof VariantOptionsService
	 */
	async create(name: string, variant: Variant): Promise<VariantOption> {
		try {
			// Verify if exist a variantOption with the same name
			await this.throwErrorIfExistName(name, variant)

			// Create variantOption
			const variantOption = this.variantOptionsRepository.create({
				name: name,
				variant,
			})
			await this.variantOptionsRepository.save(variantOption)

			// Delete client info
			return variantOption
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all VariantOptions for a Variant
	 * @param {Variant} variant
	 * @return {*}  {Promise<VariantOption[]>}
	 * @memberof VariantOptionsService
	 */
	async findAll(variant: Variant): Promise<VariantOption[]> {
		try {
			const queryBuilder = this.variantOptionsRepository.createQueryBuilder(
				this.queryBuilderAlias,
			)

			const variantOptions = await queryBuilder
				.leftJoinAndSelect(`${this.queryBuilderAlias}.variant`, 'variant')
				.where('variant_id = :variantId', { variantId: variant.id })
				.getMany()

			return variantOptions
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find a VariantOption by term and Variant
	 * @param {string} term
	 * @param {Variant} variant
	 * @return {*}  {Promise<VariantOption>}
	 * @memberof VariantOptionsService
	 */
	async findOne(term: string, variant: Variant): Promise<VariantOption> {
		let variantOption: VariantOption | undefined = undefined
		const queryBuilder = this.variantOptionsRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)

		const where: WhereQueryBuilder = !isNaN(Number(term))
			? {
					condition: 'id = :id',
					parameters: { id: +term },
				}
			: {
					condition: 'UPPER(name) = :name',
					parameters: { name: term.toUpperCase() },
				}

		variantOption = await queryBuilder
			.where(where.condition, where.parameters)
			.andWhere('variant_id = :variantId', { variantId: variant.id })
			.getOne()

		if (variantOption) return variantOption

		this.errorAdapter.throwBadRequestNotFoundError(
			`Option with id/name '${term}' not found`,
		)
	}

	/**
	 * Update a VariantOption by id
	 * @param {number} id
	 * @param {string} name
	 * @param {Variant} variant
	 * @return {*}  {Promise<VariantOption>}
	 * @memberof VariantOptionsService
	 */
	async update(
		id: number,
		name: string,
		variant: Variant,
	): Promise<VariantOption> {
		try {
			// Verify if exist a variantOption with the same name
			await this.throwErrorIfExistName(name, variant)

			// preload: search for id and preload the fields in name
			const variantOption = await this.variantOptionsRepository.preload({
				name: name,
				id,
				variant,
			})

			if (!variantOption)
				this.errorAdapter.throwBadRequestNotFoundError(
					`Option with id '${id}' not found`,
				)

			// Create Query Runner
			const queryRunner = this.dataSource.createQueryRunner()
			await queryRunner.connect()
			await queryRunner.startTransaction()

			// Save variantOption
			await queryRunner.manager.save(variantOption)
			await queryRunner.commitTransaction()

			// Release Query Runner
			await queryRunner.release()

			return variantOption
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Delete a VariantOption by id
	 * @param {number} id
	 * @param {Variant} variant
	 * @return {*}  {Promise<VariantOption>}
	 * @memberof VariantOptionsService
	 */
	async delete(id: number, variant: Variant): Promise<VariantOption> {
		try {
			const variantOption = await this.findOne(id.toString(), variant)
			await this.variantOptionsRepository.remove(variantOption)
			return variantOption
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Transform VariantOption[] in VariantOptionSummary[]
	 * @param {VariantOption[]} variantOptions
	 * @return {*}  {VariantOptionSummary[]}
	 * @memberof VariantOptionsService
	 */
	transformArrayToSummaries(
		variantOptions: VariantOption[],
	): VariantOptionSummary[] {
		return variantOptions.map(variantOption =>
			this.transformToSummary(variantOption),
		)
	}

	/**
	 * Transform VariantOption in VariantOptionSummary
	 * @param {VariantOption} variantOption
	 * @return {*}  {VariantOptionSummary}
	 * @memberof VariantOptionsService
	 */
	transformToSummary(variantOption: VariantOption): VariantOptionSummary {
		const { id, name, variant } = variantOption
		return { id, name, variantId: variant?.id }
	}

	/**
	 * Throw error if exist an option with same name
	 * @param {string} name
	 * @param {Variant} variant
	 * @return {*}  {Promise<void>}
	 * @memberof VariantOptionsService
	 */
	async throwErrorIfExistName(name: string, variant: Variant): Promise<void> {
		const isValidName = await this.isValidName(name, variant)
		if (!isValidName)
			this.errorAdapter.throwBadRequestDuplicateKeyError(
				`Already exist an option with name '${name}'`,
			)
	}

	/**
	 * Throw error if exist an option with same name in string[]
	 * @param {string[]} names
	 * @param {Variant} variant
	 * @return {*}  {Promise<void>}
	 * @memberof VariantOptionsService
	 */
	async throwErrorIfExistAnyName(
		names: string[],
		variant: Variant,
	): Promise<void> {
		const isValidName = await this.areValidNames(names, variant)

		if (!isValidName)
			this.errorAdapter.throwBadRequestDuplicateKeyError(
				`Already exist option with some names: ${names.join(', ')}`,
			)
	}

	/**
	 * Verify is name is valid for a variant option
	 * @private
	 * @param {string} name
	 * @param {Variant} variant
	 * @return {*}  {Promise<boolean>}
	 * @memberof VariantOptionsService
	 */
	private async isValidName(name: string, variant: Variant): Promise<boolean> {
		const variantOption = await this.findOne(name, variant).catch(() => {})
		return !variantOption
	}

	/**
	 * Verify if string[] have valid names
	 * @private
	 * @param {string[]} names
	 * @param {Variant} variant
	 * @return {*}  {Promise<boolean>}
	 * @memberof VariantOptionsService
	 */
	private async areValidNames(
		names: string[],
		variant: Variant,
	): Promise<boolean> {
		const options = await this.findAll(variant)
		const namesInDB = options.map(option => option.name)
		return !hasCommonElement(names, namesInDB)
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
