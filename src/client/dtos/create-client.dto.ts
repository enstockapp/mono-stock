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

export class CreateClientDto {
	@IsOptional()
	@IsUUID()
	id?: string

	@IsString()
	@MinLength(1)
	name: string

	@IsOptional()
	@IsString()
	@MinLength(1)
	lastname?: string

	@IsEnum(IdentificationType)
	identificationType: IdentificationType

	@IsString()
	@MinLength(5)
	identification: string

	@IsEmail()
	email: string

	@IsPhoneNumber()
	phoneNumber: string

	@IsOptional()
	@IsString()
	@MinLength(8)
	direction?: string

	@IsEnum(Currency)
	mainCurrency: Currency
}
