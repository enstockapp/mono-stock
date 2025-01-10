import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common'

import { Auth, GetUser } from 'src/auth'
import { Client } from 'src/client'
import { RoleEnum } from 'src/roles'
import { PaginatedResponse, PaginationDto } from 'src/common'

import { CategoriesService } from './categories.service'
import { CreateCategoryDto, UpdateCategoryDto } from './dtos'
import { Category } from './entities'

@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	/**
	 * Create a new category
	 * @param {CreateCategoryDto} createCategoryDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof CategoriesController
	 */
	@Post()
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	create(
		@Body() createCategoryDto: CreateCategoryDto,
		@GetUser('client') client: Client,
	): Promise<Category> {
		return this.categoriesService.create(createCategoryDto, client)
	}

	/**
	 * Find all categories by client
	 * @param {PaginationDto} paginationDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof CategoriesController
	 */
	@Get()
	@Auth()
	findAll(
		@Query() paginationDto: PaginationDto,
		@GetUser('client') client: Client,
	): Promise<PaginatedResponse> {
		return this.categoriesService.findAll(paginationDto, client)
	}

	/**
	 * Find one category by id
	 * @param {string} term
	 * @param {Client} client
	 * @return {*}
	 * @memberof CategoriesController
	 */
	@Get(':term')
	@Auth()
	findOne(
		@Param('term') term: string,
		@GetUser('client') client: Client,
	): Promise<Category> {
		return this.categoriesService.findOne(term, client)
	}

	/**
	 * Update a category by id
	 * @param {number} id
	 * @param {CreateCategoryDto} updateCategoryDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof CategoriesController
	 */
	@Patch(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCategoryDto: UpdateCategoryDto,
		@GetUser('client') client: Client,
	): Promise<Category> {
		return this.categoriesService.update(id, updateCategoryDto, client)
	}

	/**
	 * Delete category by id
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<Category>}
	 * @memberof CategoriesController
	 */
	@Delete(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	remove(
		@Param('id', ParseIntPipe) id: number,
		@GetUser('client') client: Client,
	): Promise<Category> {
		return this.categoriesService.delete(id, client)
	}
}
