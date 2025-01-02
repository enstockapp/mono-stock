import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
} from '@nestjs/common'

import { ClientsService } from './clients.service'
import { Client } from './entities'
import { CreateClientDto } from './dtos/create-client.dto'
import { Auth } from 'src/auth'
import { RoleEnum } from 'src/roles'

@Controller('clients')
export class ClientsController {
	constructor(private readonly clientService: ClientsService) {}

	@Post('/create')
	@Auth(RoleEnum.superAdmin)
	create(@Body() createClientDto: CreateClientDto): Promise<Client> {
		return this.clientService.create(createClientDto)
	}

	@Get('/:id')
	@Auth(RoleEnum.superAdmin)
	findOneById(@Param('id', ParseUUIDPipe) id: string): Promise<Client> {
		return this.clientService.findOneById(id)
	}
}
