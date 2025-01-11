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

import { VariantsService } from './services'
import { CreateVariantDto, UpdateVariantDto } from './dtos'
import { VariantSummary } from './interfaces'

@Controller('variants')
export class VariantsController {
	constructor(private readonly variantsService: VariantsService) {}

	/**
	 * Create a Variant
	 * @param {CreateVariantDto} createVariantDto
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsController
	 */
	@Post()
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	create(
		@Body() createVariantDto: CreateVariantDto,
		@GetUser('client') client: Client,
	): Promise<VariantSummary> {
		return this.variantsService.create(createVariantDto, client)
	}

	/**
	 * Find all VariantSummary by client
	 * @param {PaginationDto} paginationDto
	 * @param {Client} client
	 * @return {*}  {Promise<PaginatedResponse>}
	 * @memberof VariantsController
	 */
	@Get()
	@Auth()
	findAll(
		@Query() paginationDto: PaginationDto,
		@GetUser('client') client: Client,
	): Promise<PaginatedResponse> {
		return this.variantsService.findAll(paginationDto, client)
	}

	/**
	 * Find a VariantSummary by term (id,name)
	 * @param {string} term
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsController
	 */
	@Get(':term')
	@Auth()
	findOne(
		@Param('term') term: string,
		@GetUser('client') client: Client,
	): Promise<VariantSummary> {
		return this.variantsService.findOne(term, client)
	}

	/**
	 * Update a Variant and VariantOptions
	 * @param {number} id
	 * @param {UpdateVariantDto} updateVariantDto
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsController
	 */
	@Patch(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateVariantDto: UpdateVariantDto,
		@GetUser('client') client: Client,
	): Promise<VariantSummary> {
		return this.variantsService.update(id, updateVariantDto, client)
	}

	/**
	 * Delete variant by id
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<VariantSummary>}
	 * @memberof VariantsController
	 */
	@Delete(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	remove(
		@Param('id', ParseIntPipe) id: number,
		@GetUser('client') client: Client,
	): Promise<VariantSummary> {
		return this.variantsService.delete(id, client)
	}
}
