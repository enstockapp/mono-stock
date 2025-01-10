import { Repository, In } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { HandleErrorAdapter, Status } from 'src/common'
import { Variant, VariantsService, VariantSummary } from 'src/variants'

import { ItemVariantDto, StockDto } from '../dto'
import { Product, ProductStock } from '../entities'
import { ProductStockType } from '../enums'

@Injectable()
export class ProductStocksService {
	private readonly context: string = 'ProductStocksService'
	private readonly queryBuilderAlias: string = 'product_stock'

	constructor(
		@InjectRepository(ProductStock)
		private readonly productStocksRepository: Repository<ProductStock>,
		private readonly variantsService: VariantsService,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create ProductStock without variants
	 * @param {Product} product
	 * @param {StockDto} stock
	 * @return {*}  {Promise<ProductStock>}
	 * @memberof ProductStocksService
	 */
	async createUnique(product: Product, stock: StockDto): Promise<ProductStock> {
		try {
			const productStock = this.productStocksRepository.create({
				...stock,
				product,
				type: ProductStockType.Unique,
				cost: product.baseCost,
				quantity: stock.initialQuantity,
			})

			await this.productStocksRepository.save(productStock)

			return productStock
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Create multiples ProductStock with variants from a single Product
	 * @param {Product} product
	 * @param {ItemVariantDto[]} itemsVariants
	 * @param {(Variant[] | VariantSummary[])} uniqueVariants
	 * @return {*}  {Promise<ProductStock[]>}
	 * @memberof ProductStocksService
	 */
	async createWithVariants(
		product: Product,
		itemsVariants: ItemVariantDto[],
		uniqueVariants: Variant[] | VariantSummary[],
	): Promise<ProductStock[]> {
		try {
			// Create all posibilities of combinations with Status.Inactive if were not sended
			const allCombinationsArr =
				this.variantsService.getAllPossibleOptionCombinations(
					uniqueVariants as Variant[],
				)

			const allCombinationsItemVariants: ItemVariantDto[] =
				allCombinationsArr.map(combination => {
					const currentOptionCombination: number[] = combination
						.map(variantOption => variantOption.id)
						.toSorted((a, b) => a - b)

					const currentOptionCombinationStr =
						currentOptionCombination.toString()

					const currentItemVariant = itemsVariants.filter(
						iv =>
							iv.optionCombination.toSorted((a, b) => a - b).toString() ===
							currentOptionCombinationStr,
					)

					if (currentItemVariant.length > 0) return currentItemVariant[0]

					return {
						optionCombination: currentOptionCombination,
						stock: {
							initialQuantity: 0,
							status: Status.Inactive,
						},
					}
				})

			const promises = []
			allCombinationsItemVariants.forEach(itemVariant =>
				promises.push(this.createWithVariant(product, itemVariant)),
			)
			return await Promise.all(promises)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Create ProductStock with variant
	 * @param {Product} product
	 * @param {ItemVariantDto} itemsVariant
	 * @return {*}  {Promise<any>}
	 * @memberof ProductStocksService
	 */
	async createWithVariant(
		product: Product,
		itemsVariant: ItemVariantDto,
	): Promise<any> {
		const { optionCombination, stock } = itemsVariant
		try {
			const productStock = this.productStocksRepository.create({
				...stock,
				product,
				type: ProductStockType.Child,
				quantity: stock.initialQuantity,
				cost: product.baseCost,
				optionCombination,
			})

			await this.productStocksRepository.save(productStock)
			return productStock
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all by ids
	 * @private
	 * @param {number[]} ids
	 * @return {*}  {Promise<any>}
	 * @memberof ProductStocksService
	 */
	private async _findAllByIds(ids: number[]): Promise<any> {
		const productStocks = await this.productStocksRepository.find({
			where: { id: In(ids) },
			relations: { optionCombination: true },
		})
		return productStocks
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
