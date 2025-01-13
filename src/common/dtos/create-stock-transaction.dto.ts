import { ApiProperty } from '@nestjs/swagger'
import { Currency, DocumentType } from '../enums'
import {
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator'

export class CreateStockTransactionDto {
	@ApiProperty({ default: DocumentType.None })
	@IsOptional()
	@IsEnum(DocumentType)
	documentType?: DocumentType

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	invoiceNumber?: string

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	controlNumber?: string

	@ApiProperty()
	@IsDateString()
	date: Date

	@ApiProperty({
		description:
			"If it's different to the clients currency, need to send: currencyExchangeFrom, currencyExchangeTo, exchangeRate",
	})
	@IsEnum(Currency)
	currency: Currency

	@ApiProperty({
		description: 'Send it if clients currency != purchase currency',
		required: false,
	})
	@IsOptional()
	@IsEnum(Currency)
	currencyExchangeFrom?: Currency

	@ApiProperty({
		description: 'Send it if clients currency != purchase currency',
		required: false,
	})
	@IsOptional()
	@IsEnum(Currency)
	currencyExchangeTo?: Currency

	@ApiProperty({
		description:
			'Send it if clients currency != purchase currency. (maxDecimalPlaces: 2)',
		required: false,
		default: 1,
	})
	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsPositive()
	exchangeRate?: number

	@ApiProperty({ required: false })
	@IsOptional()
	metadata?: Record<string, any>

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	comment?: string
}
