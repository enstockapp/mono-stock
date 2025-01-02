import { Body, Controller, Post } from '@nestjs/common'
import { LoginUserDto } from './dtos'
import { CreateUserDto } from 'src/users/dtos'

import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// TODO: Only Super-admin
	@Post('register')
	create(@Body() createUserDto: CreateUserDto) {
		return this.authService.create(createUserDto)
	}

	@Post('login')
	login(@Body() loginUserDto: LoginUserDto) {
		return this.authService.login(loginUserDto)
	}
}
