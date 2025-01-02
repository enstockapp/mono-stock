import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common'
import { UsersService } from './users.service'
import { PublicUser } from './interfaces'
import { Auth } from 'src/auth'
import { RoleEnum } from 'src/roles'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('/:id')
	@Auth(RoleEnum.superAdmin)
	async findOneById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<PublicUser> {
		return (await this.usersService.findOneById(id, true)) as PublicUser
	}
}
