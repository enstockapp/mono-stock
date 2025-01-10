import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator'
import { passwordRegex } from 'src/common'

export class LoginUserDto {
	@ApiProperty()
	@IsEmail()
	email: string

	@ApiProperty()
	@IsString()
	@MinLength(6)
	@MaxLength(50)
	@Matches(passwordRegex, {
		message:
			'The password must have a Uppercase, lowercase letter and a number',
	})
	password: string
}
