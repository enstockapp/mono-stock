import { DataSource, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Client } from 'src/client'
import {
	getPagination,
	HandleErrorAdapter,
	PaginatedResponse,
	PaginationDto,
	WhereQueryBuilder,
} from 'src/common'

import { Category } from './entities'
import { CreateCategoryDto, UpdateCategoryDto } from './dtos'

@Injectable()
export class CategoriesService {
	private readonly context: string = 'CategoriesService'
	private readonly queryBuilderAlias: string = 'category'

	constructor(
		@InjectRepository(Category)
		private readonly categoriesRepository: Repository<Category>,
		private readonly dataSource: DataSource,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create a new category
	 * @param {CreateCategoryDto} createCategoryDto
	 * @param {Client} client
	 * @return {*}  {Promise<Category>}
	 * @memberof CategoriesService
	 */
	async create(
		createCategoryDto: CreateCategoryDto,
		client: Client,
	): Promise<Category> {
		const { name } = createCategoryDto
		try {
			// Verify if exist a category with the same name
			await this.throwErrorIfExistName(name, client)

			// Create category
			const category = this.categoriesRepository.create({
				...createCategoryDto,
				client: client,
			})
			await this.categoriesRepository.save(category)

			// Delete client info
			return this.getPlainEntity(category)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all categories by client
	 * @param {PaginationDto} paginationDto
	 * @param {Client} client
	 * @return {*}  {Promise<PaginatedResponse>}
	 * @memberof CategoriesService
	 */
	async findAll(
		paginationDto: PaginationDto,
		client: Client,
	): Promise<PaginatedResponse> {
		const { limit, offset, page, size } = getPagination(paginationDto)
		try {
			const queryBuilder = this.categoriesRepository.createQueryBuilder(
				this.queryBuilderAlias,
			)

			const [categories, total] = await queryBuilder
				.where('client_id = :clientId', { clientId: client.id })
				.limit(limit)
				.offset(offset)
				.orderBy(`${this.queryBuilderAlias}.name`, 'ASC')
				.getManyAndCount()

			return { page, size, items: categories, total }
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find one category by id and client
	 * @param {string} term
	 * @param {Client} client
	 * @return {*}  {Promise<Category>}
	 * @memberof CategoriesService
	 */
	async findOne(term: string, client: Client): Promise<Category> {
		let category: Category | undefined = undefined
		const queryBuilder = this.categoriesRepository.createQueryBuilder(
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

		category = await queryBuilder
			.where(where.condition, where.parameters)
			.andWhere('client_id = :clientId', { clientId: client.id })
			.getOne()

		if (category) return category

		this.errorAdapter.throwBadRequestNotFoundError(
			`Category with id/name '${term}' not found`,
		)
	}

	/**
	 * Update a category
	 * @param {number} id
	 * @param {CreateCategoryDto} updateCategoryDto
	 * @param {Client} client
	 * @return {*}  {Promise<Category>}
	 * @memberof CategoriesService
	 */
	async update(
		id: number,
		updateCategoryDto: UpdateCategoryDto,
		client: Client,
	): Promise<Category> {
		const { name } = updateCategoryDto
		try {
			// Verify if exist a category with the same name
			if (name) await this.throwErrorIfExistName(name, client)

			// preload: search for id and preload the fields in updateCategoryDto
			const category = await this.categoriesRepository.preload({
				...updateCategoryDto,
				id,
				client,
			})

			if (!category)
				this.errorAdapter.throwBadRequestNotFoundError(
					`Category with id '${id}' not found`,
				)

			// Create Query Runner
			const queryRunner = this.dataSource.createQueryRunner()
			await queryRunner.connect()
			await queryRunner.startTransaction()

			// Save category
			await queryRunner.manager.save(category)
			await queryRunner.commitTransaction()

			// Release Query Runner
			await queryRunner.release()

			return this.getPlainEntity(category)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Delete a category
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<Category>}
	 * @memberof CategoriesService
	 */
	async delete(id: number, client: Client): Promise<Category> {
		try {
			const category = await this.findOne(id.toString(), client)
			await this.categoriesRepository.remove(category)
			return category
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Return a plain category. clientId instead Client object
	 * @private
	 * @param {Category} category
	 * @return {*}  {Category}
	 * @memberof CategoriesService
	 */
	private getPlainEntity(category: Category): Category {
		category.clientId = category.client?.id
		delete category.client
		return category
	}

	/**
	 * Throw error if exist a category with same name
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<void>}
	 * @memberof CategoriesService
	 */
	private async throwErrorIfExistName(
		name: string,
		client: Client,
	): Promise<void> {
		const isValidName = await this.isValidName(name, client)

		if (!isValidName)
			this.errorAdapter.throwBadRequestDuplicateKeyError(
				`Already exist a category with name '${name}'`,
			)
	}

	/**
	 * Return true if does not exist a category with same name. False if do exist
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<boolean>}
	 * @memberof CategoriesService
	 */
	private async isValidName(name: string, client: Client): Promise<boolean> {
		const category = await this.findOne(name, client).catch(() => {})
		return !category
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
