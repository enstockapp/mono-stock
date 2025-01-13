import { ILike, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import {
	Currency,
	getPagination,
	getSorting,
	HandleErrorAdapter,
	PaginatedResponse,
	PaginationDto,
	SortingDto,
} from 'src/common'
import { Client } from 'src/client'
import { SuppliersService } from 'src/suppliers'

import {
	CreatePurchaseDto,
	getPurchasesFiltering,
	PurchasesFilteringDto,
} from '../dtos'
import { Purchase } from '../entities'
import { PurchaseItemsService } from './purchase-items.service'
import { ValidSortingValuesPurchases } from '../constants'

@Injectable()
export class PurchasesService {
	private readonly context: string = 'PurchasesService'
	private readonly queryBuilderAlias: string = 'purchase'

	constructor(
		@InjectRepository(Purchase)
		private readonly purchasesRepository: Repository<Purchase>,
		private readonly purchaseItemsService: PurchaseItemsService,
		private readonly supplierService: SuppliersService,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create Purchase
	 * @param {CreatePurchaseDto} createPurchaseDto
	 * @param {Client} client
	 * @return {*}  {Promise<Purchase>}
	 * @memberof PurchasesService
	 */
	async create(
		createPurchaseDto: CreatePurchaseDto,
		client: Client,
	): Promise<Purchase> {
		const { purchaseItems, supplierId } = createPurchaseDto
		const { mainCurrency } = client

		try {
			// Validate currencies
			const { currencyExchangeFrom, currencyExchangeTo, exchangeRate } =
				this._validateCurrencyExchange(createPurchaseDto, mainCurrency)

			// Validate supplierId
			const supplier = await this.supplierService.findOne(supplierId, client)

			const { purchaseItemsWithStock, total } =
				await this.purchaseItemsService.validationForPurchaseItems(
					purchaseItems,
					client,
				)

			// Create and save purchase
			const purchase = this.purchasesRepository.create({
				...createPurchaseDto,
				currencyExchangeFrom,
				currencyExchangeTo,
				exchangeRate,
				total,
				supplier,
				client,
			})

			await this.purchasesRepository.save(purchase)

			// Save purchaseItem and update ProductStock.quantity
			// and Product.averageCost, Product.baseCost, Product.totalForAverageCost
			const newPurchaseItems = await this.purchaseItemsService.createMultiples(
				purchaseItemsWithStock,
				purchase,
			)

			purchase.purchaseItems = newPurchaseItems
			return purchase
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all purchase by filters
	 * @param {PaginationDto} paginationDto
	 * @param {SortingDto} sortingDto
	 * @param {PurchasesFilteringDto} filteringDto
	 * @param {Client} client
	 * @return {*}  {Promise<PaginatedResponse>}
	 * @memberof PurchasesService
	 */
	async findAll(
		paginationDto: PaginationDto,
		sortingDto: SortingDto,
		filteringDto: PurchasesFilteringDto,
		client: Client,
	): Promise<PaginatedResponse> {
		const { limit, offset, page, size } = getPagination(paginationDto)
		const { sort, order } = getSorting(sortingDto, ValidSortingValuesPurchases)
		const {
			searchTerm = '',
			documentType,
			currency,
		} = getPurchasesFiltering(filteringDto)

		const defaultWhere: any = { client: { id: client.id }, isActive: true }
		if (documentType) defaultWhere.documentType = documentType
		if (currency) defaultWhere.currency = currency

		const where = !searchTerm
			? defaultWhere
			: [
					{
						...defaultWhere,
						invoiceNumber: ILike(`%${searchTerm}%`),
					},
					{
						...defaultWhere,
						controlNumber: ILike(`%${searchTerm}%`),
					},
					{
						...defaultWhere,
						description: ILike(`%${searchTerm}%`),
					},
				]

		const [purchases, total] = await this.purchasesRepository.findAndCount({
			where,
			relations: {
				supplier: true,
				purchaseItems: { productStock: { product: true } },
			},
			skip: offset,
			take: limit,
			order: { [sort]: order },
		})

		return { page, size, total, items: purchases }
	}

	/**
	 * Find one Purchase by id
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<Purchase>}
	 * @memberof PurchasesService
	 */
	async findOne(id: number, client: Client): Promise<Purchase> {
		const queryBuilder = this.purchasesRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)

		const purchase = await queryBuilder
			.leftJoinAndSelect(`${this.queryBuilderAlias}.supplier`, 'supplier')
			.leftJoinAndSelect(
				`${this.queryBuilderAlias}.purchaseItems`,
				'purchaseItem',
			)
			.leftJoinAndSelect(`purchaseItem.productStock`, 'productStock')
			.leftJoinAndSelect(`productStock.product`, 'product')
			.where(`${this.queryBuilderAlias}.id = :id`, { id })
			.andWhere(`${this.queryBuilderAlias}.client_id = :clientId`, {
				clientId: client.id,
			})
			.andWhere(`${this.queryBuilderAlias}.is_active = :isActive`, {
				isActive: true,
			})
			.getOne()

		if (purchase) return purchase

		this.errorAdapter.throwBadRequestNotFoundError(
			`Purchase with id '${id}' not found`,
		)
	}

	/**
	 * Delete a Purchase by id
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<Purchase>}
	 * @memberof PurchasesService
	 */
	async delete(id: number, client: Client): Promise<Purchase> {
		const queryBuilder = this.purchasesRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)
		try {
			const purchase = await this.findOne(id, client)

			// Delete Purchase
			await queryBuilder
				.update(Purchase)
				.set({ isActive: false })
				.where('id = :id', { id: purchase.id })
				.execute()

			// Delete PurchaseItems
			await this.purchaseItemsService.deleteByPurchase(
				purchase,
				purchase.purchaseItems,
				client,
			)

			return purchase
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Validate currencyExchange for a Purchase
	 * @private
	 * @param {CreatePurchaseDto} purchaseDto
	 * @param {Currency} mainCurrency
	 * @return {*}  {{
	 * 		currencyExchangeFrom: Currency
	 * 		currencyExchangeTo: Currency
	 * 		exchangeRate: number
	 * 	}}
	 * @memberof PurchasesService
	 */
	private _validateCurrencyExchange(
		purchaseDto: CreatePurchaseDto,
		mainCurrency: Currency,
	): {
		currencyExchangeFrom: Currency
		currencyExchangeTo: Currency
		exchangeRate: number
	} {
		const { currencyExchangeFrom, currencyExchangeTo, exchangeRate, currency } =
			purchaseDto
		// Validate currencies
		if (currency === mainCurrency)
			return {
				currencyExchangeFrom: currency,
				currencyExchangeTo: currency,
				exchangeRate: 1,
			}

		// Validate there are not null values
		if (!currencyExchangeFrom || !currencyExchangeTo || !exchangeRate)
			this.errorAdapter.throwBadRequestValidationError(
				`The variables currencyExchangeFrom, currencyExchangeTo and exchangeRate are required`,
			)

		// Validate are different variables
		if (currencyExchangeFrom === currencyExchangeTo) {
			this.errorAdapter.throwBadRequestValidationError(
				`The variables currencyExchangeFrom and currencyExchangeTo must be differents`,
			)
		}

		// Validate at least one currencyExchage is the same mainCurrency and there are not null
		const currencies = [currency, mainCurrency]
		if (
			!currencies.includes(currencyExchangeFrom) ||
			!currencies.includes(currencyExchangeTo)
		)
			this.errorAdapter.throwBadRequestValidationError(
				`The variables currencyExchangeFrom and currencyExchangeTo must be: ${currencies.join('or ')}`,
			)

		return { currencyExchangeFrom, currencyExchangeTo, exchangeRate }
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
