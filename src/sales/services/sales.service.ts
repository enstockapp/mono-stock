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
import { CustomersService } from 'src/customers'

import { CreateSaleDto, getSalesFiltering, SalesFilteringDto } from '../dtos'
import { Sale } from '../entities'
import { SaleItemsService } from './sale-items.service'
import { ValidSortingValuesSales } from '../constants'

@Injectable()
export class SalesService {
	private readonly context: string = 'SalesService'
	private readonly queryBuilderAlias: string = 'sale'

	constructor(
		@InjectRepository(Sale)
		private readonly salesRepository: Repository<Sale>,
		private readonly saleItemsService: SaleItemsService,
		private readonly customerService: CustomersService,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	async create(createSaleDto: CreateSaleDto, client: Client): Promise<Sale> {
		const { saleItems, customerId } = createSaleDto
		const { mainCurrency } = client

		try {
			// Validate currencies
			const { currencyExchangeFrom, currencyExchangeTo, exchangeRate } =
				this._validateCurrencyExchange(createSaleDto, mainCurrency)

			// Validate customerId
			const customer = await this.customerService.findOne(customerId, client)

			const { saleItemsWithStock, total } =
				await this.saleItemsService.validationForSaleItems(saleItems, client)

			// Create and save sale
			const sale = this.salesRepository.create({
				...createSaleDto,
				currencyExchangeFrom,
				currencyExchangeTo,
				exchangeRate,
				total,
				customer,
				client,
			})

			await this.salesRepository.save(sale)

			// Save saleItem and update ProductStock.quantity
			// and Product.averageCost, Product.baseCost, Product.totalForAverageCost
			const newSaleItems = await this.saleItemsService.createMultiples(
				saleItemsWithStock,
				sale,
			)

			sale.saleItems = newSaleItems
			return sale
		} catch (error) {
			this.handleDBError(error)
		}
	}

	async findAll(
		paginationDto: PaginationDto,
		sortingDto: SortingDto,
		filteringDto: SalesFilteringDto,
		client: Client,
	): Promise<PaginatedResponse> {
		const { limit, offset, page, size } = getPagination(paginationDto)
		const { sort, order } = getSorting(sortingDto, ValidSortingValuesSales)
		const {
			searchTerm = '',
			documentType,
			currency,
		} = getSalesFiltering(filteringDto)

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

		const [sales, total] = await this.salesRepository.findAndCount({
			where,
			relations: {
				customer: true,
				saleItems: { productStock: { product: true } },
			},
			skip: offset,
			take: limit,
			order: { [sort]: order },
		})

		return { page, size, total, items: sales }
	}

	async findOne(id: number, client: Client): Promise<Sale> {
		const queryBuilder = this.salesRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)

		const sale = await queryBuilder
			.leftJoinAndSelect(`${this.queryBuilderAlias}.customer`, 'customer')
			.leftJoinAndSelect(`${this.queryBuilderAlias}.saleItems`, 'saleItem')
			.leftJoinAndSelect(`saleItem.productStock`, 'productStock')
			.leftJoinAndSelect(`productStock.product`, 'product')
			.where(`${this.queryBuilderAlias}.id = :id`, { id })
			.andWhere(`${this.queryBuilderAlias}.client_id = :clientId`, {
				clientId: client.id,
			})
			.andWhere(`${this.queryBuilderAlias}.is_active = :isActive`, {
				isActive: true,
			})
			.getOne()

		if (sale) return sale

		this.errorAdapter.throwBadRequestNotFoundError(
			`Sale with id '${id}' not found`,
		)
	}

	async delete(id: number, client: Client): Promise<Sale> {
		const queryBuilder = this.salesRepository.createQueryBuilder(
			this.queryBuilderAlias,
		)
		try {
			const sale = await this.findOne(id, client)

			// Delete Sale
			await queryBuilder
				.update(Sale)
				.set({ isActive: false })
				.where('id = :id', { id: sale.id })
				.execute()

			// Delete SaleItems
			await this.saleItemsService.deleteBySale(sale, sale.saleItems, client)

			return sale
		} catch (error) {
			this.handleDBError(error)
		}
	}

	private _validateCurrencyExchange(
		saleDto: CreateSaleDto,
		mainCurrency: Currency,
	): {
		currencyExchangeFrom: Currency
		currencyExchangeTo: Currency
		exchangeRate: number
	} {
		const { currencyExchangeFrom, currencyExchangeTo, exchangeRate, currency } =
			saleDto
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
