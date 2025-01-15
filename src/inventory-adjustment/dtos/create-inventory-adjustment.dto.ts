import { ApiProperty } from '@nestjs/swagger'
import {
	IsEnum,
	IsNumber,
	IsObject,
	IsOptional,
	IsPositive,
	IsString,
	MinLength,
} from 'class-validator'
import { AdjustmentType } from '../enums'

export class CreateInventoryAdjustmentDto {
	@ApiProperty()
	@IsNumber()
	@IsPositive()
	productStockId: number

	@ApiProperty()
	@IsEnum(AdjustmentType)
	adjustmentType: AdjustmentType

	@ApiProperty()
	@IsNumber()
	@IsPositive()
	quantity: number

	@ApiProperty()
	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>

	@ApiProperty()
	@IsString()
	@MinLength(5)
	comment: string
}
