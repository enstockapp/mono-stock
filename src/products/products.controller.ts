import {
	Controller,
	Post,
	Body,
	Get,
	Query,
	Param,
	Patch,
	ParseIntPipe,
	Delete,
} from '@nestjs/common'

import {
	ApiSorting,
	PaginatedResponse,
	PaginationDto,
	SortingDto,
} from 'src/common'
import { Auth, GetUser } from 'src/auth'
import { Client } from 'src/client'
import { RoleEnum } from 'src/roles'

import {
	CreateProductUniqueDto,
	CreateProductWithVariantsDto,
	UpdateProductDto,
	ProductsFilteringDto,
} from './dto'
import { ProductsService } from './services'
import { Product } from './entities'
import { ValidSortingValuesProducts } from './constants'

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	/**
	 * Create a product without variants
	 * @param {CreateProductUniqueDto} createProductUniqueDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof ProductsController
	 */
	@Post('unique')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	createUnique(
		@Body() createProductUniqueDto: CreateProductUniqueDto,
		@GetUser('client') client: Client,
	): Promise<Product> {
		return this.productsService.createUnique(createProductUniqueDto, client)
	}

	/**
	 * Create product with variants
	 * @param {CreateProductWithVariantsDto} createProductWithVariantsDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof ProductsController
	 */
	@Post('with-variants')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	createWithVariants(
		@Body() createProductWithVariantsDto: CreateProductWithVariantsDto,
		@GetUser('client') client: Client,
	): Promise<Product> {
		return this.productsService.createWithVariants(
			createProductWithVariantsDto,
			client,
		)
	}

	/**
	 * Find all products by params
	 * @param {PaginationDto} paginationDto
	 * @param {SortingDto} sortingDto
	 * @param {ProductsFilteringDto} filteringDto
	 * @param {Client} client
	 * @return {*}  {Promise<PaginatedResponse>}
	 * @memberof ProductsController
	 */
	@Get()
	@Auth()
	@ApiSorting(ValidSortingValuesProducts)
	findAll(
		@Query() paginationDto: PaginationDto,
		@Query() sortingDto: SortingDto,
		@Query() filteringDto: ProductsFilteringDto,
		@GetUser('client') client: Client,
	): Promise<PaginatedResponse> {
		return this.productsService.findAll(
			paginationDto,
			sortingDto,
			filteringDto,
			client,
		)
	}

	/**
	 * Find one product by id or name
	 * @param {string} term
	 * @param {Client} client
	 * @return {*}  {Promise<Product>}
	 * @memberof ProductsController
	 */
	@Get(':term')
	@Auth()
	findOne(
		@Param('term') term: string,
		@GetUser('client') client: Client,
	): Promise<Product> {
		return this.productsService.findOne(term, client)
	}

	/**
	 * Update a product base data
	 * @param {number} id
	 * @param {UpdateProductDto} updateProductUniqueDto
	 * @param {Client} client
	 * @return {*}  {Promise<Product>}
	 * @memberof ProductsController
	 */
	@Patch(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateProductUniqueDto: UpdateProductDto,
		@GetUser('client') client: Client,
	): Promise<Product> {
		return this.productsService.update(id, updateProductUniqueDto, client)
	}

	/**
	 * Delete a product
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<Product>}
	 * @memberof ProductsController
	 */
	@Delete(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	remove(
		@Param('id', ParseIntPipe) id: number,
		@GetUser('client') client: Client,
	): Promise<Product> {
		return this.productsService.delete(id, client)
	}
}
