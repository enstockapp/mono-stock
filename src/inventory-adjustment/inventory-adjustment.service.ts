import { FindOptionsWhere, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'

import { ProductStocksService } from 'src/products'
import {
	getPagination,
	getSorting,
	HandleErrorAdapter,
	PaginatedResponse,
	PaginationDto,
	SortingDto,
	Variation,
} from 'src/common'
import { Client } from 'src/client'
import { User } from 'src/users'

import {
	CreateInventoryAdjustmentDto,
	getInventoryAdjustmentsFiltering,
	InventoryAdjustmentsFilteringDto,
} from './dtos'
import { AdjustmentType } from './enums'
import { ValidSortingValuesInventoryAdjustment } from './constants'
import { InventoryAdjustment } from './entities'
import { InventoryAdjustmentExtended } from './interfaces'

@Injectable()
export class InventoryAdjustmentService {
	private readonly context: string = 'InventoryAdjustmentService'
	private readonly queryBuilderAlias: string = 'inventory-adjustment'

	constructor(
		@InjectRepository(InventoryAdjustment)
		private readonly inventoryAdjustmentRepository: Repository<InventoryAdjustment>,
		private readonly productStocksService: ProductStocksService,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create a InventoryAdjustment
	 * @param {CreateInventoryAdjustmentDto} createInventoryAdjustmentDto
	 * @param {User} user
	 * @param {Client} client
	 * @return {*}
	 * @memberof InventoryAdjustmentService
	 */
	async create(
		createInventoryAdjustmentDto: CreateInventoryAdjustmentDto,
		user: User,
		client: Client,
	) {
		const { productStockId, quantity, adjustmentType } =
			createInventoryAdjustmentDto
		try {
			// Validate productStockId
			const productStock = await this.productStocksService.findOneById(
				productStockId,
				client,
			)

			// Create inventory adjustemnt
			const inventoryAdjustment = this.inventoryAdjustmentRepository.create({
				...createInventoryAdjustmentDto,
				user,
				productStock,
			})

			// Update quantity
			const variation =
				adjustmentType === AdjustmentType.Increment
					? Variation.Increment
					: Variation.Decrement

			await this.productStocksService.updateQuantity(
				productStock,
				quantity,
				variation,
			)

			// Save inventoryAdjustment after correctly update quantity
			await this.inventoryAdjustmentRepository.save(inventoryAdjustment)

			return inventoryAdjustment
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all InventoryAdjustment by client
	 * @param {PaginationDto} paginationDto
	 * @param {SortingDto} sortingDto
	 * @param {InventoryAdjustmentsFilteringDto} filteringDto
	 * @param {Client} client
	 * @return {*}  {Promise<PaginatedResponse>}
	 * @memberof InventoryAdjustmentService
	 */
	async findAll(
		paginationDto: PaginationDto,
		sortingDto: SortingDto,
		filteringDto: InventoryAdjustmentsFilteringDto,
		client: Client,
	): Promise<PaginatedResponse> {
		const { limit, offset, page, size } = getPagination(paginationDto)
		const { sort, order } = getSorting(
			sortingDto,
			ValidSortingValuesInventoryAdjustment,
		)
		const { adjustmentType } = getInventoryAdjustmentsFiltering(filteringDto)

		const where: FindOptionsWhere<InventoryAdjustment> = {
			user: { client: { id: client.id } },
		}

		if (adjustmentType) where.adjustmentType = adjustmentType

		const [inventoryAdjustments, total] =
			await this.inventoryAdjustmentRepository.findAndCount({
				where,
				relations: {
					user: true,
					productStock: { product: true },
				},
				skip: offset,
				take: limit,
				order: { [sort]: order },
			})

		const inventoryAdjustmentExtended: InventoryAdjustmentExtended[] =
			inventoryAdjustments.map(inventoryAdjustments => {
				const { productStock } = inventoryAdjustments
				const { product } = productStock
				return {
					...inventoryAdjustments,
					productStock: this.productStocksService.getProductStockExtended(
						productStock,
						product,
					),
				}
			})

		return { page, size, total, items: inventoryAdjustmentExtended }
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
