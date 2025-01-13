import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { EntityAction, HandleErrorAdapter } from 'src/common'

import { PurchaseItemDto } from '../dtos'
import { Purchase, PurchaseItem } from '../entities'
import { PurchaseItemWithStock } from '../interfaces'
import {
	ProductsService,
	ProductStock,
	ProductStocksService,
} from 'src/products'
import { Client } from 'src/client'

@Injectable()
export class PurchaseItemsService {
	private readonly context: string = 'PurchaseItemsService'
	private readonly queryBuilderAlias: string = 'purchase-item'

	constructor(
		@InjectRepository(PurchaseItem)
		private readonly purchaseItemsRepository: Repository<PurchaseItem>,
		private readonly productsService: ProductsService,
		private readonly productStocksService: ProductStocksService,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create multiple purchaseItems
	 * @param {PurchaseItemWithStock[]} purchaseItemsWithStock
	 * @param {Purchase} purchase
	 * @return {*}  {Promise<PurchaseItem[]>}
	 * @memberof PurchaseItemsService
	 */
	async createMultiples(
		purchaseItemsWithStock: PurchaseItemWithStock[],
		purchase: Purchase,
	): Promise<PurchaseItem[]> {
		try {
			const promises = []
			purchaseItemsWithStock.forEach(purchaseItem =>
				promises.push(this._create(purchaseItem, purchase)),
			)
			return await Promise.all(promises)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Create a single PurchaseItem
	 * @private
	 * @param {PurchaseItemWithStock} purchaseItemWithStock
	 * @param {Purchase} purchase
	 * @return {*}  {Promise<PurchaseItem>}
	 * @memberof PurchaseItemsService
	 */
	private async _create(
		purchaseItemWithStock: PurchaseItemWithStock,
		purchase: Purchase,
	): Promise<PurchaseItem> {
		const { purchaseItemDto, productStock } = purchaseItemWithStock

		try {
			const purchaseItem = this.purchaseItemsRepository.create({
				...purchaseItemDto,
				productStock,
				purchase,
			})
			await this.purchaseItemsRepository.save(purchaseItem)

			purchaseItemWithStock.purchaseItemDto = purchaseItem
			await this.productsService.updateProductStockAndProductFromPurchase(
				purchaseItemWithStock,
				purchase,
				EntityAction.Create,
			)

			return purchaseItem
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all PurchaseItem by Purchase.id
	 *
	 * @param {number} purchaseId
	 * @return {*}  {Promise<PurchaseItem[]>}
	 * @memberof PurchaseItemsService
	 */
	async findAllByPurchaseId(purchaseId: number): Promise<PurchaseItem[]> {
		const purchaseItems = await this.purchaseItemsRepository.find({
			where: { purchase: { id: purchaseId } },
			relations: { productStock: { product: true } },
		})
		if (purchaseItems.length > 0) return purchaseItems

		this.errorAdapter.throwBadRequestNotFoundError(
			`PurchaseItems with purchaseId '${purchaseId}' not found`,
		)
	}

	/**
	 * Delete all PurchaseItem by Purchase
	 * @param {Purchase} purchase
	 * @param {PurchaseItem[]} purchaseItems
	 * @param {Client} client
	 * @return {*}  {Promise<PurchaseItem[]>}
	 * @memberof PurchaseItemsService
	 */
	async deleteByPurchase(
		purchase: Purchase,
		purchaseItems: PurchaseItem[],
		client: Client,
	): Promise<PurchaseItem[]> {
		const queryBuilder = this.purchaseItemsRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)

		try {
			const { generatedMaps } = await queryBuilder
				.update(PurchaseItem)
				.set({ isActive: false })
				.where('purchase_id = :id', { id: purchase.id })
				.execute()

			const promises = []

			purchaseItems.forEach(purchaseItem => {
				const promise =
					this.productsService.updateProductStockAndProductFromPurchase(
						{
							client,
							purchaseItemDto: { ...purchaseItem },
							productStock: purchaseItem.productStock,
							product: purchaseItem.productStock.product,
							purchase,
						},
						purchase,
						EntityAction.Delete,
					)
				promises.push(promise)
			})

			await Promise.all(promises)

			return generatedMaps as PurchaseItem[]
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Validate PurchaseItemsDto and get PurchaseItemWithStock[] and total amount
	 * @param {PurchaseItemDto[]} purchaseItems
	 * @param {Client} client
	 * @return {*}  {Promise<{
	 * 		purchaseItemsWithStock: PurchaseItemWithStock[]
	 * 		total: number
	 * 	}>}
	 * @memberof PurchaseItemsService
	 */
	async validationForPurchaseItems(
		purchaseItems: PurchaseItemDto[],
		client: Client,
	): Promise<{
		purchaseItemsWithStock: PurchaseItemWithStock[]
		total: number
	}> {
		// Validate all purchaseItem.productStockId
		const productStocks =
			await this.productStocksService.validateProductStockIdsByClient(
				purchaseItems.map(item => item.productStockId),
				client,
			)

		// Get PurchaseItemWithStock for a single parameter
		const purchaseItemsWithStock = this._getPurchaseItemsWithStock(
			purchaseItems,
			productStocks,
			client,
		)

		// Calculate purchase.total
		const total = +purchaseItems
			.reduce(
				(accumulator, item) => accumulator + item.amount * item.quantity,
				0,
			)
			.toFixed(2)

		return { purchaseItemsWithStock, total }
	}

	/**
	 * Get PurchaseItemWithStock from PurchaseItemDto[] and ProductStock[]
	 * @private
	 * @param {PurchaseItemDto[]} purchaseItemsDto
	 * @param {ProductStock[]} productStocks
	 * @param {Client} client
	 * @return {*}  {PurchaseItemWithStock[]}
	 * @memberof PurchaseItemsService
	 */
	private _getPurchaseItemsWithStock(
		purchaseItemsDto: PurchaseItemDto[],
		productStocks: ProductStock[],
		client: Client,
	): PurchaseItemWithStock[] {
		const purchaseItemWithStockArr: PurchaseItemWithStock[] = []

		for (const purchaseItemDto of purchaseItemsDto) {
			const productStocksFiltered = productStocks.filter(
				ps => ps.id === purchaseItemDto.productStockId,
			)

			if (productStocksFiltered.length <= 0)
				this.errorAdapter.throwBadRequestNotFoundError(
					`[getPurchaseItemsWithStock] ProductStock with id '${purchaseItemDto.productStockId}' not found`,
				)

			const purchaseItemWithStock: PurchaseItemWithStock = {
				purchaseItemDto,
				productStock: productStocksFiltered[0],
				product: productStocksFiltered[0].product,
				client,
			}
			purchaseItemWithStockArr.push(purchaseItemWithStock)
		}

		return purchaseItemWithStockArr
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
