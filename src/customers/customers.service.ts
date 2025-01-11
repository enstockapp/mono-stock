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

import { Customer } from './entities'
import { CreateCustomerDto, UpdateCustomerDto } from './dtos'

@Injectable()
export class CustomersService {
	private readonly context: string = 'CustomersService'
	private readonly queryBuilderAlias: string = 'customer'

	constructor(
		@InjectRepository(Customer)
		private readonly customersRepository: Repository<Customer>,
		private readonly dataSource: DataSource,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	async create(createCustomerDto: CreateCustomerDto, client: Client) {
		const { name } = createCustomerDto
		try {
			// Verify if exist a category with the same name
			await this.throwErrorIfExistName(name, client)

			// Create category
			const customer = this.customersRepository.create({
				...createCustomerDto,
				client: client,
			})

			await this.customersRepository.save(customer)

			return this.getPlainEntity(customer)
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
			const queryBuilder = this.customersRepository.createQueryBuilder(
				this.queryBuilderAlias,
			)

			const [customers, total] = await queryBuilder
				.where('client_id = :clientId', { clientId: client.id })
				.limit(limit)
				.offset(offset)
				.orderBy(`${this.queryBuilderAlias}.name`, 'ASC')
				.getManyAndCount()

			return { page, size, items: customers, total }
		} catch (error) {
			this.handleDBError(error)
		}
	}

	async findOne(term: string, client: Client): Promise<Customer> {
		let customer: Customer | undefined = undefined
		const queryBuilder = this.customersRepository.createQueryBuilder(
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

		customer = await queryBuilder
			.where(where.condition, where.parameters)
			.andWhere('client_id = :clientId', { clientId: client.id })
			.getOne()

		if (customer) return customer

		throw new BadRequestException(
			this.errorAdapter.getNotFoundError(
				`Customer with id/name '${term}' not found`,
			),
		)
	}

	async update(
		id: number,
		updateCustomerDto: UpdateCustomerDto,
		client: Client,
	): Promise<Customer> {
		const { name } = updateCustomerDto
		try {
			// Verify if exist a category with the same name
			if (name) await this.throwErrorIfExistName(name, client)

			// preload: search for id and preload the fields in updateCustomerDto
			const customer = await this.customersRepository.preload({
				...updateCustomerDto,
				id,
				client,
			})

			if (!customer)
				throw new BadRequestException(
					this.errorAdapter.getNotFoundError(
						`Customer with id '${id}' not found`,
					),
				)

			// Create Query Runner
			const queryRunner = this.dataSource.createQueryRunner()
			await queryRunner.connect()
			await queryRunner.startTransaction()

			// Save Customer
			await queryRunner.manager.save(customer)
			await queryRunner.commitTransaction()

			// Release Query Runner
			await queryRunner.release()

			return this.getPlainEntity(customer)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Delete a customer
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<Customer>}
	 * @memberof CustomersService
	 */
	async delete(id: number, client: Client): Promise<Customer> {
		try {
			const customer = await this.findOne(id.toString(), client)
			await this.customersRepository.remove(customer)
			return customer
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Return a plain Customer. clientId instead Client object
	 * @private
	 * @param {Customer} customer
	 * @return {*}  {Customer}
	 * @memberof CustomersService
	 */
	private getPlainEntity(customer: Customer): Customer {
		customer.clientId = customer.client?.id
		delete customer.client
		return customer
	}
	/**
	 * Throw error if exist a customer with same name
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<void>}
	 * @memberof CustomersService
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
	 * Return true if does not exist a customer with same name. False if do exist
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<boolean>}
	 * @memberof CustomersService
	 */
	private async isValidName(name: string, client: Client): Promise<boolean> {
		const customer = await this.findOne(name, client).catch(() => {})
		return !customer
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
