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
import { ApiProperty } from '@nestjs/swagger'
import { RoleEnum } from 'src/roles'
import { passwordRegex } from 'src/common'

export class CreateUserDto {
	@ApiProperty()
	@IsOptional()
	@IsUUID()
	id?: string

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

	@ApiProperty()
	@IsString()
	@MinLength(1)
	name: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	lastname?: string

	@ApiProperty()
	@IsUUID()
	clientId: string

	@ApiProperty()
	@IsEnum(RoleEnum, { each: true })
	roles: RoleEnum[]
}
