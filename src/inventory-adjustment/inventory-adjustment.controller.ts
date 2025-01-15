import { Body, Controller, Get, Post, Query } from '@nestjs/common'

import { Auth, GetUser } from 'src/auth'
import { RoleEnum } from 'src/roles'
import { User } from 'src/users'
import {
	ApiSorting,
	PaginatedResponse,
	PaginationDto,
	SortingDto,
} from 'src/common'
import { Client } from 'src/client'

import {
	CreateInventoryAdjustmentDto,
	InventoryAdjustmentsFilteringDto,
} from './dtos'
import { InventoryAdjustment } from './entities'
import { ValidSortingValuesInventoryAdjustment } from './constants'
import { InventoryAdjustmentService } from './inventory-adjustment.service'

@Controller('inventory-adjustment')
export class InventoryAdjustmentController {
	constructor(
		private readonly inventoryAdjustmentService: InventoryAdjustmentService,
	) {}

	/**
	 * Create a InventoryAdjustment
	 * @param {CreateInventoryAdjustmentDto} createInventoryAdjustmentDto
	 * @param {User} user
	 * @return {*}  {Promise<InventoryAdjustment>}
	 * @memberof InventoryAdjustmentController
	 */
	@Post()
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	create(
		@Body() createInventoryAdjustmentDto: CreateInventoryAdjustmentDto,
		@GetUser() user: User,
	): Promise<InventoryAdjustment> {
		return this.inventoryAdjustmentService.create(
			createInventoryAdjustmentDto,
			user,
			user.client,
		)
	}

	/**
	 * Get all InventoryAdjustment by client
	 * @param {PaginationDto} paginationDto
	 * @param {SortingDto} sortingDto
	 * @param {InventoryAdjustmentsFilteringDto} filteringDto
	 * @param {Client} client
	 * @return {*}  {Promise<PaginatedResponse>}
	 * @memberof InventoryAdjustmentController
	 */
	@Get()
	@Auth()
	@ApiSorting(ValidSortingValuesInventoryAdjustment)
	findAll(
		@Query() paginationDto: PaginationDto,
		@Query() sortingDto: SortingDto,
		@Query() filteringDto: InventoryAdjustmentsFilteringDto,
		@GetUser('client') client: Client,
	): Promise<PaginatedResponse> {
		return this.inventoryAdjustmentService.findAll(
			paginationDto,
			sortingDto,
			filteringDto,
			client,
		)
	}
}
