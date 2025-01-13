import { Repository, DataSource } from 'typeorm'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import {
	getPagination,
	HandleErrorAdapter,
	PaginatedResponse,
	PaginationDto,
	WhereQueryBuilder,
} from 'src/common'
import { Client } from 'src/client'

import { Supplier } from './entities'
import { CreateSupplierDto, UpdateSupplierDto } from './dtos'

@Injectable()
export class SuppliersService {
	private readonly context: string = 'SuppliersService'
	private readonly queryBuilderAlias: string = 'supplier'

	constructor(
		@InjectRepository(Supplier)
		private readonly suppliersRepository: Repository<Supplier>,
		private readonly dataSource: DataSource,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	async create(createSupplierDto: CreateSupplierDto, client: Client) {
		const { name } = createSupplierDto
		try {
			// Verify if exist a category with the same name
			await this.throwErrorIfExistName(name, client)

			// Create category
			const supplier = this.suppliersRepository.create({
				...createSupplierDto,
				client: client,
			})

			await this.suppliersRepository.save(supplier)

			return this.getPlainEntity(supplier)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	async findAll(
		paginationDto: PaginationDto,
		client: Client,
	): Promise<PaginatedResponse> {
		const { limit, offset, page, size } = getPagination(paginationDto)

		try {
			const queryBuilder = this.suppliersRepository.createQueryBuilder(
				this.queryBuilderAlias,
			)

			const [suppliers, total] = await queryBuilder
				.where('client_id = :clientId', { clientId: client.id })
				.limit(limit)
				.offset(offset)
				.orderBy(`${this.queryBuilderAlias}.name`, 'ASC')
				.getManyAndCount()

			return { page, size, items: suppliers, total }
		} catch (error) {
			this.handleDBError(error)
		}
	}

	async findOne(term: string | number, client: Client): Promise<Supplier> {
		let supplier: Supplier | undefined = undefined
		const queryBuilder = this.suppliersRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)

		const where: WhereQueryBuilder = !isNaN(Number(term))
			? {
					condition: 'id = :id',
					parameters: { id: +term },
				}
			: {
					condition: 'UPPER(name) = :name',
					parameters: { name: `${term}`.toUpperCase() },
				}

		supplier = await queryBuilder
			.where(where.condition, where.parameters)
			.andWhere('client_id = :clientId', { clientId: client.id })
			.getOne()

		if (supplier) return supplier

		throw new BadRequestException(
			this.errorAdapter.getNotFoundError(
				`Supplier with id/name '${term}' not found`,
			),
		)
	}

	async update(
		id: number,
		updateSupplierDto: UpdateSupplierDto,
		client: Client,
	): Promise<Supplier> {
		const { name } = updateSupplierDto
		try {
			// Verify if exist a category with the same name
			if (name) await this.throwErrorIfExistName(name, client)

			// preload: search for id and preload the fields in updateSupplierDto
			const supplier = await this.suppliersRepository.preload({
				...updateSupplierDto,
				id,
				client,
			})

			if (!supplier)
				throw new BadRequestException(
					this.errorAdapter.getNotFoundError(
						`Supplier with id '${id}' not found`,
					),
				)

			// Create Query Runner
			const queryRunner = this.dataSource.createQueryRunner()
			await queryRunner.connect()
			await queryRunner.startTransaction()

			// Save Supplier
			await queryRunner.manager.save(supplier)
			await queryRunner.commitTransaction()

			// Release Query Runner
			await queryRunner.release()

			return this.getPlainEntity(supplier)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Delete a supplier
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<Supplier>}
	 * @memberof SuppliersService
	 */
	async delete(id: number, client: Client): Promise<Supplier> {
		try {
			const supplier = await this.findOne(id.toString(), client)
			await this.suppliersRepository.remove(supplier)
			return supplier
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Return a plain Supplier. clientId instead Client object
	 * @private
	 * @param {Supplier} supplier
	 * @return {*}  {Supplier}
	 * @memberof SuppliersService
	 */
	private getPlainEntity(supplier: Supplier): Supplier {
		supplier.clientId = supplier.client?.id
		delete supplier.client
		return supplier
	}
	/**
	 * Throw error if exist a supplier with same name
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<void>}
	 * @memberof SuppliersService
	 */
	private async throwErrorIfExistName(
		name: string,
		client: Client,
	): Promise<void> {
		const isValidName = await this.isValidName(name, client)

		if (!isValidName)
			throw new BadRequestException(
				this.errorAdapter.getDuplicateKeyError(
					`Already exist a category with name '${name}'`,
				),
			)
	}

	/**
	 * Return true if does not exist a supplier with same name. False if do exist
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<boolean>}
	 * @memberof SuppliersService
	 */
	private async isValidName(name: string, client: Client): Promise<boolean> {
		const supplier = await this.findOne(name, client).catch(() => {})
		return !supplier
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
