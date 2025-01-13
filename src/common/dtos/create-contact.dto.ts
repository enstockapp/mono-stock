import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsPhoneNumber,
	IsString,
	MinLength,
} from 'class-validator'
import { IdentificationType } from 'src/common'

export class CreateContactDto {
	@ApiProperty()
	@IsString()
	@MinLength(3)
	name: string

	@ApiProperty()
	@IsOptional()
	@IsEnum(IdentificationType)
	identificationType?: IdentificationType

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(6)
	identification?: string

	@ApiProperty()
	@IsOptional()
	@IsPhoneNumber()
	phoneNumber?: string

	@ApiProperty()
	@IsOptional()
	@IsEmail()
	email?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(8)
	direction?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(5)
	notes?: string
}
