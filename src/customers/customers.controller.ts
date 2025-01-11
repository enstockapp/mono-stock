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

import { CustomersService } from './customers.service'
import { CreateCustomerDto, UpdateCustomerDto } from './dtos'
import { Customer } from './entities'

@Controller('customers')
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	/**
	 * Create a new customer
	 * @param {CreateCustomerDto} createCustomerDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof CustomersController
	 */
	@Post()
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	create(
		@Body() createCustomerDto: CreateCustomerDto,
		@GetUser('client') client: Client,
	): Promise<Customer> {
		return this.customersService.create(createCustomerDto, client)
	}

	/**
	 * Find all customers by client
	 * @param {PaginationDto} paginationDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof CustomersController
	 */
	@Get()
	@Auth()
	findAll(
		@Query() paginationDto: PaginationDto,
		@GetUser('client') client: Client,
	): Promise<PaginatedResponse> {
		return this.customersService.findAll(paginationDto, client)
	}

	/**
	 * Find one customer by id
	 * @param {string} term
	 * @param {Client} client
	 * @return {*}
	 * @memberof CustomersController
	 */
	@Get(':term')
	@Auth()
	findOne(
		@Param('term') term: string,
		@GetUser('client') client: Client,
	): Promise<Customer> {
		return this.customersService.findOne(term, client)
	}

	/**
	 * Update a customer by id
	 * @param {number} id
	 * @param {UpdateCustomerDto} updateCustomerDto
	 * @param {Client} client
	 * @return {*}
	 * @memberof CustomersController
	 */
	@Patch(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCustomerDto: UpdateCustomerDto,
		@GetUser('client') client: Client,
	): Promise<Customer> {
		return this.customersService.update(id, updateCustomerDto, client)
	}

	/**
	 * Delete customer by id
	 * @param {number} id
	 * @param {Client} client
	 * @return {*}  {Promise<customer>}
	 * @memberof CustomersController
	 */
	@Delete(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	remove(
		@Param('id', ParseIntPipe) id: number,
		@GetUser('client') client: Client,
	): Promise<Customer> {
		return this.customersService.delete(id, client)
	}
}
