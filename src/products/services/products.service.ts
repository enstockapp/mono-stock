import { DataSource, DeepPartial, ILike, Repository } from 'typeorm'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import {
	EntityAction,
	getAmountInMainCurrency,
	getPagination,
	getSorting,
	getUniqueArraysNumbersArray,
	HandleErrorAdapter,
	PaginatedResponse,
	PaginationDto,
	SortingDto,
	Variation,
	WhereQueryBuilder,
} from 'src/common'
import { Client } from 'src/client'
import { CategoriesService, Category } from 'src/categories'
import { VariantsService } from 'src/variants'
import { Purchase, PurchaseItem, PurchaseItemWithStock } from 'src/purchases'

import {
	CreateProductUniqueDto,
	CreateProductWithVariantsDto,
	UpdateProductDto,
	getProductsFiltering,
	ProductsFilteringDto,
} from '../dto'
import { Product } from '../entities'
import { ProductType } from '../enums'
import { ProductStocksService } from './product-stocks.service'
import { ProductVariantsService } from './product-variants.service'
import { ValidSortingValuesProducts } from '../constants'
import { PurchaseItemDto } from 'src/purchases/dtos'

@Injectable()
export class ProductsService {
	private readonly context: string = 'ProductsService'
	private readonly queryBuilderAlias: string = 'product'

	constructor(
		@InjectRepository(Product)
		private readonly productsRepository: Repository<Product>,
		private readonly productVariantsService: ProductVariantsService,
		private readonly productStocksService: ProductStocksService,
		private readonly categoriesService: CategoriesService,
		private readonly variantsService: VariantsService,
		private readonly dataSource: DataSource,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create a product without variants
	 * @param {CreateProductUniqueDto} createProductUniqueDto
	 * @param {Client} client
	 * @return {*}  {Promise<Product>}
	 * @memberof ProductsService
	 */
	async createUnique(
		createProductUniqueDto: CreateProductUniqueDto,
		client: Client,
	): Promise<Product> {
		const { product, stock } = createProductUniqueDto
		let category: Category = undefined

		try {
			// Validate categoryId if exist
			if (product.categoryId) {
				category = await this.categoriesService.findOne(
					product.categoryId.toString(),
					client,
				)
			}
			// Verify if exist a product with the same name
			await this.throwErrorIfExistName(product.name, client)
			// Create Product
			const newProduct = this.productsRepository.create({
				...product,
				type: ProductType.Unique,
				averageCost: product.baseCost,
				totalForAverageCost: stock.initialQuantity || 0,
				category,
				client,
			})
			await this.productsRepository.save(newProduct)
			// Save Product and ProductStock
			const productStock = await this.productStocksService.createUnique(
				newProduct,
				stock,
			)
			// Return ProductWithStock
			newProduct.stocks = [productStock]
			return newProduct
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Create a product with variants
	 * @param {CreateProductWithVariantsDto} createProductWithVariantsDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof ProductsService
	 */
	async createWithVariants(
		createProductWithVariantsDto: CreateProductWithVariantsDto,
		client: Client,
	): Promise<Product> {
		const { product, itemsVariants } = createProductWithVariantsDto
		let category: Category = undefined

		try {
			// Calculate totalForAverageCost
			const totalForAverageCost = itemsVariants
				.map(item => item.stock.initialQuantity)
				.reduce((acumlator, value) => acumlator + value, 0)

			// Validate all itemsVariants.optionCombinations are differents
			const allOptionCombination = itemsVariants.map(
				itemVariant => itemVariant.optionCombination,
			)
			const uniqueOptionCombination =
				getUniqueArraysNumbersArray(allOptionCombination)

			if (allOptionCombination.length !== uniqueOptionCombination.length)
				throw new BadRequestException(
					this.errorAdapter.getValidationError(
						`One or more optionCombinations are identical`,
					),
				)

			// Validate variants and options combinacions for the product
			// and get uniqueVariantsSummaries array
			const uniqueVariantsSummaries =
				await this.variantsService.validateIdsAndOptionsCombinations(
					itemsVariants.map(item => item.optionCombination),
					client,
				)

			// Validate categoryId if exist
			if (product.categoryId) {
				category = await this.categoriesService.findOne(
					product.categoryId.toString(),
					client,
				)
			}

			// Verify if exist a product with the same name
			await this.throwErrorIfExistName(product.name, client)

			// Create and save Product
			const newProduct = this.productsRepository.create({
				...product,
				type: ProductType.Parent,
				averageCost: product.baseCost,
				totalForAverageCost,
				category,
				client,
			})
			// Save Product
			await this.productsRepository.save(newProduct)

			// Save all
			// Save ProductVariants
			const productVariants = await this.productVariantsService.createMultiples(
				newProduct,
				uniqueVariantsSummaries,
			)

			// Save ProductStock
			const productStocks = await this.productStocksService.createWithVariants(
				newProduct,
				itemsVariants,
				uniqueVariantsSummaries,
			)

			// Update Variants canEdit
			await this.variantsService.blockEdit(
				uniqueVariantsSummaries.map(variant => variant.id),
			)

			// Return ProductWithStock
			newProduct.stocks = productStocks
			newProduct.variants = productVariants
			return newProduct
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all products by params
	 * @param {PaginationDto} paginationDto
	 * @param {SortingDto} sortingDto
	 * @param {ProductsFilteringDto} filteringDto
	 * @param {Client} client
	 * @return {*}  {Promise<PaginatedResponse>}
	 * @memberof ProductsService
	 */
	async findAll(
		paginationDto: PaginationDto,
		sortingDto: SortingDto,
		filteringDto: ProductsFilteringDto,
		client: Client,
	): Promise<PaginatedResponse> {
		const { limit, offset, page, size } = getPagination(paginationDto)
		const { sort, order } = getSorting(sortingDto, ValidSortingValuesProducts)
		const { searchTerm = '', status } = getProductsFiltering(filteringDto)

		const defaultWhere = { client: { id: client.id }, status }

		const where = !searchTerm
			? defaultWhere
			: [
					{
						...defaultWhere,
						name: ILike(`%${searchTerm}%`),
					},
					{
						...defaultWhere,
						reference: ILike(`%${searchTerm}%`),
					},
					{
						...defaultWhere,
						description: ILike(`%${searchTerm}%`),
					},
				]

		const [products, total] = await this.productsRepository.findAndCount({
			where,
			relations: {
				variants: { variant: { variantOptions: true } },
				category: true,
				stocks: true,
			},
			skip: offset,
			take: limit,
			order: { [sort]: order },
		})

		return { page, size, total, items: products }
	}

	/**
	 * Find one product by name or id
	 * @param {string} term
	 * @param {Client} client
	 * @return {*}  {Promise<Product>}
	 * @memberof ProductsService
	 */
	async findOne(term: string | number, client: Client): Promise<Product> {
		const queryBuilder = this.productsRepository.createQueryBuilder(
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

		const product = await queryBuilder
			.where(where.condition, where.parameters)
			.andWhere('client_id = :clientId', { clientId: client.id })
			.getOne()

		if (product) return product

		throw new BadRequestException(
			this.errorAdapter.getNotFoundError(
				`Product with id/name '${term}' not found`,
			),
		)
	}

	/**
	 * Update baseCost, averageCost and totalForAverageCost
	 * @param {Purchase} purchase
	 * @param {PurchaseItem} purchaseItem
	 * @param {Product} product
	 * @param {Client} client
	 * @return {*}  {Promise<Product>}
	 * @memberof ProductsService
	 */
	async updateCostFromPurchaseItem(
		purchase: Purchase,
		purchaseItem: PurchaseItem | PurchaseItemDto,
		product: Product,
		client: Client,
		action: EntityAction.Create | EntityAction.Delete,
	): Promise<Product> {
		const { currency, currencyExchangeFrom, exchangeRate } = purchase
		const { id, totalForAverageCost, averageCost } = product
		const { updateProductBaseCost, quantity, amount } = purchaseItem
		const { mainCurrency } = client

		const cost = getAmountInMainCurrency(
			mainCurrency,
			currency,
			currencyExchangeFrom,
			exchangeRate,
			amount,
		)

		// Create Product like
		const productLike: DeepPartial<Product> = { client }

		// calculate new values
		const currentTotalCost = totalForAverageCost * averageCost
		const amountToModifyTotalCost = quantity * cost

		let newTotalForAverageCost = totalForAverageCost + quantity
		let newAverageCost =
			(currentTotalCost + amountToModifyTotalCost) / newTotalForAverageCost

		// If it's a delete, substract
		if (action === EntityAction.Delete) {
			newTotalForAverageCost = totalForAverageCost - quantity
			newAverageCost =
				(currentTotalCost - amountToModifyTotalCost) / newTotalForAverageCost
		}

		if (updateProductBaseCost) productLike.baseCost = +cost.toFixed(2)
		productLike.totalForAverageCost = newTotalForAverageCost
		productLike.averageCost = +newAverageCost.toFixed(2)

		return await this._update(id, productLike)
	}

	/**
	 * Update base product data
	 * @param {number} id
	 * @param {UpdateProductDto} updateProductDto
	 * @param {Client} client
	 * @return {*}  {Promise<any>}
	 * @memberof ProductsService
	 */
	async update(
		id: number,
		updateProductDto: UpdateProductDto,
		client: Client,
	): Promise<Product> {
		return await this._update(id, {
			...updateProductDto,
			client,
		})
	}

	/**
	 * Private update Product
	 * @private
	 * @param {number} id
	 * @param {DeepPartial<Product>} entityLike
	 * @return {*}  {Promise<Product>}
	 * @memberof ProductsService
	 */
	private async _update(
		id: number,
		entityLike: DeepPartial<Product>,
	): Promise<Product> {
		const { name, client } = entityLike
		try {
			// Verify if exist a category with the same name
			if (name) await this.throwErrorIfExistName(name, client as Client)

			// preload: search for id and preload the fields
			const product = await this.productsRepository.preload({
				...entityLike,
				id,
			})

			if (!product)
				throw new BadRequestException(
					this.errorAdapter.getNotFoundError(
						`Product with id '${id}' not found`,
					),
				)

			// Create Query Runner
			const queryRunner = this.dataSource.createQueryRunner()
			await queryRunner.connect()
			await queryRunner.startTransaction()

			// Save category
			await queryRunner.manager.save(product)
			await queryRunner.commitTransaction()

			// Release Query Runner
			await queryRunner.release()

			return await this.findOne(product.id, client as Client)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Delete a product by id
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<Product>}
	 * @memberof ProductsService
	 */
	async delete(id: number, client: Client): Promise<Product> {
		try {
			const product = await this.findOne(id.toString(), client)
			await this.productsRepository.remove(product)
			return product
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Update product (averageCost, totalForAverageCost, baseCost) and ProductStock quantity
	 * @param {PurchaseItemWithStock} purchaseItemWithStock
	 * @param {Purchase} purchase
	 * @param {(EntityAction.Create | EntityAction.Delete)} entityAction
	 * @memberof ProductsService
	 */
	async updateProductStockAndProduct(
		purchaseItemWithStock: PurchaseItemWithStock,
		purchase: Purchase,
		entityAction: EntityAction.Create | EntityAction.Delete,
	) {
		const { productStock, product, client, purchaseItemDto } =
			purchaseItemWithStock

		// Update productStocks: quantity
		const variation =
			entityAction === EntityAction.Delete
				? Variation.Decrement
				: Variation.Increment

		await this.productStocksService.updateQuantity(
			productStock,
			purchaseItemDto.quantity,
			variation,
		)

		// Update product: averageCost, totalForAverageCost, baseCost
		await this.updateCostFromPurchaseItem(
			purchase,
			purchaseItemDto as PurchaseItemDto,
			product,
			client,
			entityAction,
		)
	}

	/**
	 * Throw error if exist a product with same name
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<void>}
	 * @memberof ProductsService
	 */
	private async throwErrorIfExistName(
		name: string,
		client: Client,
	): Promise<void> {
		const isValidName = await this.isValidName(name, client)

		if (!isValidName)
			throw new BadRequestException(
				this.errorAdapter.getDuplicateKeyError(
					`Already exist a product with name '${name}'`,
				),
			)
	}

	/**
	 * Return true if does not exist a product with same name. False if do exist
	 * @private
	 * @param {string} name
	 * @param {Client} client
	 * @return {*}  {Promise<boolean>}
	 * @memberof ProductsService
	 */
	private async isValidName(name: string, client: Client): Promise<boolean> {
		const product = await this.findOne(name, client).catch(() => {})
		return !product
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
