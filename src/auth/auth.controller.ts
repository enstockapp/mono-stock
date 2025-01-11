import { Body, Controller, Post } from '@nestjs/common'

import { CreateUserDto } from 'src/users'
import { RoleEnum } from 'src/roles'

import { LoginUserDto } from './dtos'
import { AuthService } from './auth.service'
import { Auth } from './decorators'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@Auth(RoleEnum.superAdmin)
	create(@Body() createUserDto: CreateUserDto) {
		return this.authService.create(createUserDto)
	}

	@Post('login')
	login(@Body() loginUserDto: LoginUserDto) {
		return this.authService.login(loginUserDto)
	}
}
