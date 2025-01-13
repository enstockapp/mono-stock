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
import { PurchasesService } from './services/purchases.service'
import { CreatePurchaseDto, PurchasesFilteringDto } from './dtos'
import { Auth, GetUser } from 'src/auth'
import { RoleEnum } from 'src/roles'
import { Client } from 'src/client'
import { Purchase } from './entities'
import {
	ApiSorting,
	PaginatedResponse,
	PaginationDto,
	SortingDto,
} from 'src/common'
import { ValidSortingValuesPurchases } from './constants'

@Controller('purchases')
export class PurchasesController {
	constructor(private readonly purchasesService: PurchasesService) {}

	@Post()
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	create(
		@Body() createPurchaseDto: CreatePurchaseDto,
		@GetUser('client') client: Client,
	): Promise<Purchase> {
		return this.purchasesService.create(createPurchaseDto, client)
	}

	@Get()
	@Auth()
	@ApiSorting(ValidSortingValuesPurchases)
	findAll(
		@Query() paginationDto: PaginationDto,
		@Query() sortingDto: SortingDto,
		@Query() filteringDto: PurchasesFilteringDto,
		@GetUser('client') client: Client,
	): Promise<PaginatedResponse> {
		return this.purchasesService.findAll(
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
	): Promise<Purchase> {
		return this.purchasesService.findOne(id, client)
	}

	@Delete(':id')
	@Auth(RoleEnum.superAdmin, RoleEnum.admin)
	remove(
		@Param('id', ParseIntPipe) id: number,
		@GetUser('client') client: Client,
	): Promise<Purchase> {
		return this.purchasesService.delete(id, client)
	}
}
