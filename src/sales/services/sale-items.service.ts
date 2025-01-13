import { In, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { EntityAction, HandleErrorAdapter } from 'src/common'

import { SaleItemDto } from '../dtos'
import { Sale, SaleItem } from '../entities'
import { SaleItemWithStock } from '../interfaces'
import {
	Product,
	ProductsService,
	ProductStock,
	ProductStocksService,
} from 'src/products'
import { Client } from 'src/client'

@Injectable()
export class SaleItemsService {
	private readonly context: string = 'SaleItemsService'
	private readonly queryBuilderAlias: string = 'sale-item'

	constructor(
		@InjectRepository(SaleItem)
		private readonly saleItemsRepository: Repository<SaleItem>,
		private readonly productsService: ProductsService,
		private readonly productStocksService: ProductStocksService,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	async createMultiples(
		saleItemsWithStock: SaleItemWithStock[],
		sale: Sale,
	): Promise<SaleItem[]> {
		try {
			const promises = []
			saleItemsWithStock.forEach(saleItem =>
				promises.push(this._create(saleItem, sale)),
			)
			return await Promise.all(promises)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	private async _create(
		saleItemWithStock: SaleItemWithStock,
		sale: Sale,
	): Promise<SaleItem> {
		const { saleItemDto, productStock } = saleItemWithStock

		try {
			const saleItem = this.saleItemsRepository.create({
				...saleItemDto,
				amount: productStock.product.price,
				productStock,
				sale,
			})
			await this.saleItemsRepository.save(saleItem)

			saleItemWithStock.saleItemDto = saleItem
			await this.productsService.updateProductStockAndProductFromSale(
				saleItemWithStock,
				EntityAction.Create,
			)

			return saleItem
		} catch (error) {
			this.handleDBError(error)
		}
	}

	async findAllBySaleId(saleId: number): Promise<SaleItem[]> {
		const saleItems = await this.saleItemsRepository.find({
			where: { sale: { id: saleId } },
			relations: { productStock: { product: true } },
		})
		if (saleItems.length > 0) return saleItems

		this.errorAdapter.throwBadRequestNotFoundError(
			`SaleItems with saleId '${saleId}' not found`,
		)
	}

	async findAllByIds(ids: number[]): Promise<SaleItem[]> {
		const saleItems = await this.saleItemsRepository.find({
			where: { id: In(ids) },
			relations: { productStock: { product: true } },
		})
		if (ids.length != saleItems.length)
			this.errorAdapter.throwBadRequestNotFoundError(
				`Some SaleItems ids were not found. NotFoundCount: (${ids.length - saleItems.length})`,
			)
		return saleItems
	}

	async deleteBySale(
		sale: Sale,
		saleItems: SaleItem[],
		client: Client,
	): Promise<SaleItem[]> {
		const queryBuilder = this.saleItemsRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)

		try {
			const { generatedMaps } = await queryBuilder
				.update(SaleItem)
				.set({ isActive: false })
				.where('sale_id = :id', { id: sale.id })
				.execute()

			const promises = []

			saleItems.forEach(saleItem => {
				const promise =
					this.productsService.updateProductStockAndProductFromSale(
						{
							client,
							saleItemDto: { ...saleItem },
							productStock: saleItem.productStock,
							product: saleItem.productStock.product,
							sale,
						},
						EntityAction.Delete,
					)
				promises.push(promise)
			})

			await Promise.all(promises)

			return generatedMaps as SaleItem[]
		} catch (error) {
			this.handleDBError(error)
		}
	}

	async validationForSaleItems(
		saleItems: SaleItemDto[],
		client: Client,
	): Promise<{
		saleItemsWithStock: SaleItemWithStock[]
		total: number
	}> {
		// Validate all saleItem.productStockId
		const productStocks =
			await this.productStocksService.validateProductStockIdsByClient(
				saleItems.map(item => item.productStockId),
				client,
			)

		// Get SaleItemWithStock for a single parameter
		const saleItemsWithStock = this._getSaleItemsWithStock(
			saleItems,
			productStocks,
			client,
		)

		// Calculate sale.total
		const productsByProductStockId: { [key: number]: Product } = {}
		productStocks.forEach(ps => (productsByProductStockId[ps.id] = ps.product))

		const total = +saleItems
			.reduce(
				(accumulator, item) =>
					accumulator +
					productsByProductStockId[item.productStockId].price * item.quantity,
				0,
			)
			.toFixed(2)

		return { saleItemsWithStock, total }
	}

	private _getSaleItemsWithStock(
		saleItemsDto: SaleItemDto[],
		productStocks: ProductStock[],
		client: Client,
	): SaleItemWithStock[] {
		const saleItemWithStockArr: SaleItemWithStock[] = []

		for (const saleItemDto of saleItemsDto) {
			const productStocksFiltered = productStocks.filter(
				ps => ps.id === saleItemDto.productStockId,
			)

			if (productStocksFiltered.length <= 0)
				this.errorAdapter.throwBadRequestNotFoundError(
					`[getSaleItemsWithStock] ProductStock with id '${saleItemDto.productStockId}' not found`,
				)

			const saleItemWithStock: SaleItemWithStock = {
				saleItemDto,
				productStock: productStocksFiltered[0],
				product: productStocksFiltered[0].product,
				client,
			}
			saleItemWithStockArr.push(saleItemWithStock)
		}

		return saleItemWithStockArr
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
