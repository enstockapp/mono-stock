import { Repository, In, DataSource, DeepPartial } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { HandleErrorAdapter, Status, Variation } from 'src/common'
import { Variant, VariantsService, VariantSummary } from 'src/variants'

import { ItemVariantDto, StockDto } from '../dto'
import { Product, ProductStock } from '../entities'
import { ProductStockType } from '../enums'
import { Client } from 'src/client'

@Injectable()
export class ProductStocksService {
	private readonly context: string = 'ProductStocksService'
	private readonly queryBuilderAlias: string = 'product_stock'

	constructor(
		@InjectRepository(ProductStock)
		private readonly productStocksRepository: Repository<ProductStock>,
		private readonly dataSource: DataSource,
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
	private async _findAllByIds(ids: number[]): Promise<ProductStock[]> {
		const productStocks = await this.productStocksRepository.find({
			where: { id: In(ids) },
			relations: {
				product: {
					client: true,
					variants: { variant: { variantOptions: true } },
				},
			},
		})
		if (ids.length != productStocks.length)
			this.errorAdapter.throwBadRequestNotFoundError(
				`Some ProductStock ids were not found. NotFoundCount: (${ids.length - productStocks.length})`,
			)
		return productStocks
	}

	/**
	 * Find one ProductStock by id and client
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<ProductStock>}
	 * @memberof ProductStocksService
	 */
	async findOneById(id: number, client: Client): Promise<ProductStock> {
		const queryBuilder = this.productStocksRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)

		const productStock = await queryBuilder
			.leftJoinAndSelect(`${this.queryBuilderAlias}.product`, 'product')
			.where(`${this.queryBuilderAlias}.id = :id`, { id })
			.andWhere(`product.client_id = :clientId`, { clientId: client.id })
			.getOne()

		if (productStock) return productStock

		this.errorAdapter.throwBadRequestNotFoundError(
			`ProductStock with id '${id}' not found`,
		)
	}

	/**
	 * Update quantity for a ProductStock
	 * @param {ProductStock} productStock
	 * @param {number} quantity
	 * @param {Variation} variation
	 * @return {*}  {Promise<ProductStock>}
	 * @memberof ProductStocksService
	 */
	async updateQuantity(
		productStock: ProductStock,
		quantity: number,
		variation: Variation,
	): Promise<ProductStock> {
		const newQuantity =
			variation === Variation.Increment
				? productStock.quantity + quantity
				: productStock.quantity - quantity

		return await this._update(productStock.id, { quantity: newQuantity })
	}

	/**
	 * Update a ProductStock
	 * @private
	 * @param {number} id
	 * @param {DeepPartial<ProductStock>} entityLike
	 * @return {*}  {Promise<ProductStock>}
	 * @memberof ProductStocksService
	 */
	private async _update(
		id: number,
		entityLike: DeepPartial<ProductStock>,
	): Promise<ProductStock> {
		try {
			const productStock = await this.productStocksRepository.preload({
				...entityLike,
				id,
			})

			if (!productStock)
				this.errorAdapter.throwBadRequestNotFoundError(
					`ProductStock with id '${id}' not found`,
				)

			// Create Query Runner
			const queryRunner = this.dataSource.createQueryRunner()
			await queryRunner.connect()
			await queryRunner.startTransaction()

			// Save productStock
			await queryRunner.manager.save(productStock)
			await queryRunner.commitTransaction()

			// Release Query Runner
			await queryRunner.release()

			return productStock
		} catch (error) {}
	}

	/**
	 * Validate all ids are valid for the client
	 * @param {number[]} ids
	 * @param {Client} client
	 * @return {*}  {Promise<ProductStock[]>}
	 * @memberof ProductStocksService
	 */
	async validateProductStockIdsByClient(
		ids: number[],
		client: Client,
	): Promise<ProductStock[]> {
		const productStocks = await this._findAllByIds(ids)
		const clientId = client.id
		const productStocksFiltered = productStocks.filter(
			ps => ps.product.client.id !== clientId,
		)

		if (productStocksFiltered.length > 0)
			this.errorAdapter.throwBadRequestNotFoundError(
				`Some ProductStock ids are not valid. NotValidCount: (${productStocksFiltered.length})`,
			)

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
