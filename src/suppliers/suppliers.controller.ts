import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	ParseIntPipe,
} from '@nestjs/common'

import { Auth, GetUser } from 'src/auth'
import { RoleEnum } from 'src/roles'
import { Client } from 'src/client'
import { PaginatedResponse, PaginationDto } from 'src/common'

import { SuppliersService } from './suppliers.service'
import { CreateSupplierDto, UpdateSupplierDto } from './dtos'
import { Supplier } from './entities'

@Controller('suppliers')
export class SuppliersController {
	constructor(private readonly suppliersService: SuppliersService) {}

	/**
	 * Create a new supplier
	 * @param {CreateSupplierDto} createSupplierDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof SuppliersController
	 */
	@Post()
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	create(
		@Body() createSupplierDto: CreateSupplierDto,
		@GetUser('client') client: Client,
	): Promise<Supplier> {
		return this.suppliersService.create(createSupplierDto, client)
	}

	/**
	 * Find all suppliers by client
	 * @param {PaginationDto} paginationDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof SuppliersController
	 */
	@Get()
	@Auth()
	findAll(
		@Query() paginationDto: PaginationDto,
		@GetUser('client') client: Client,
	): Promise<PaginatedResponse> {
		return this.suppliersService.findAll(paginationDto, client)
	}

	/**
	 * Find one supplier by id
	 * @param {string} term
	 * @param {Client} client
	 * @return {*}
	 * @memberof SuppliersController
	 */
	@Get(':term')
	@Auth()
	findOne(
		@Param('term') term: string,
		@GetUser('client') client: Client,
	): Promise<Supplier> {
		return this.suppliersService.findOne(term, client)
	}

	/**
	 * Update a supplier by id
	 * @param {number} id
	 * @param {UpdateSupplierDto} updateSupplierDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof SuppliersController
	 */
	@Patch(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateSupplierDto: UpdateSupplierDto,
		@GetUser('client') client: Client,
	): Promise<Supplier> {
		return this.suppliersService.update(id, updateSupplierDto, client)
	}

	/**
	 * Delete supplier by id
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<supplier>}
	 * @memberof SuppliersController
	 */
	@Delete(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	remove(
		@Param('id', ParseIntPipe) id: number,
		@GetUser('client') client: Client,
	): Promise<Supplier> {
		return this.suppliersService.delete(id, client)
	}
}
