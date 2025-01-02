import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator'
import { RoleEnum } from 'src/roles'
import { passwordRegex } from 'src/common'

export class CreateUserDto {
	@IsOptional()
	@IsUUID()
	id?: string

	@IsEmail()
	email: string

	@IsString()
	@MinLength(6)
	@MaxLength(50)
	@Matches(passwordRegex, {
		message:
			'The password must have a Uppercase, lowercase letter and a number',
	})
	password: string

	@IsString()
	@MinLength(1)
	name: string

	@IsOptional()
	@IsString()
	@MinLength(1)
	lastname?: string

	@IsUUID()
	clientId: string

	@IsEnum(RoleEnum, { each: true })
	roles: RoleEnum[]
}
