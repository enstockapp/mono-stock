import {
	Controller,
	Post,
	Body,
	Get,
	Query,
	Param,
	ParseIntPipe,
	Delete,
} from '@nestjs/common'

import { Auth, GetUser } from 'src/auth'
import { RoleEnum } from 'src/roles'
import { Client } from 'src/client'
import {
	ApiSorting,
	PaginatedResponse,
	PaginationDto,
	SortingDto,
} from 'src/common'

import { SalesService } from './services/sales.service'
import { CreateSaleDto, SalesFilteringDto } from './dtos'
import { Sale } from './entities'
import { ValidSortingValuesSales } from './constants'

@Controller('sales')
export class SalesController {
	constructor(private readonly salesService: SalesService) {}

	@Post()
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	create(
		@Body() createSaleDto: CreateSaleDto,
		@GetUser('client') client: Client,
	): Promise<Sale> {
		return this.salesService.create(createSaleDto, client)
	}

	@Get()
	@Auth()
	@ApiSorting(ValidSortingValuesSales)
	findAll(
		@Query() paginationDto: PaginationDto,
		@Query() sortingDto: SortingDto,
		@Query() filteringDto: SalesFilteringDto,
		@GetUser('client') client: Client,
	): Promise<PaginatedResponse> {
		return this.salesService.findAll(
			paginationDto,
			sortingDto,
			filteringDto,
			client,
		)
	}

	@Get(':id')
	@Auth()
	findOne(
		@Param('id', ParseIntPipe) id: number,
		@GetUser('client') client: Client,
	): Promise<Sale> {
		return this.salesService.findOne(id, client)
	}

	@Delete(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	remove(
		@Param('id', ParseIntPipe) id: number,
		@GetUser('client') client: Client,
	): Promise<Sale> {
		return this.salesService.delete(id, client)
	}
}
