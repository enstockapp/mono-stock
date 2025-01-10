import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsPhoneNumber,
	IsString,
	IsUUID,
	MinLength,
} from 'class-validator'
import { IdentificationType } from '../enums'
import { Currency } from 'src/common'
import { ApiProperty } from '@nestjs/swagger'

export class CreateClientDto {
	@ApiProperty()
	@IsOptional()
	@IsUUID()
	id?: string

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
	@IsEnum(IdentificationType)
	identificationType: IdentificationType

	@ApiProperty()
	@IsString()
	@MinLength(5)
	identification: string

	@ApiProperty()
	@IsEmail()
	email: string

	@ApiProperty()
	@IsPhoneNumber()
	phoneNumber: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(8)
	direction?: string

	@ApiProperty()
	@IsEnum(Currency)
	mainCurrency: Currency
}
