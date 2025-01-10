import {
	IsEnum,
	IsInt,
	IsNumber,
	IsObject,
	IsOptional,
	IsPositive,
	IsString,
	MinLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { MeasureUnitType } from 'src/common'
import { IProduct } from '../interfaces'

export class ProductDto implements IProduct {
	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	reference?: string

	@ApiProperty()
	@IsString()
	@MinLength(1)
	name: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	description?: string

	@ApiProperty()
	@IsEnum(MeasureUnitType)
	unitType: MeasureUnitType

	@ApiProperty({
		description: 'maxDecimalPlaces: 2',
	})
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsPositive()
	baseCost: number

	@ApiProperty({
		description: 'maxDecimalPlaces: 2',
	})
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsPositive()
	price: number

	@ApiProperty()
	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>

	@ApiProperty()
	@IsOptional()
	@IsInt()
	@IsPositive()
	categoryId?: number
}
