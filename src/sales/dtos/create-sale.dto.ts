import { ApiProperty } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsNumber,
	IsPositive,
	ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { CreateStockTransactionDto } from 'src/common'
import { SaleItemDto } from './sale-item.dto'

export class CreateSaleDto extends CreateStockTransactionDto {
	@ApiProperty()
	@IsPositive()
	@IsNumber()
	customerId?: number

	@ApiProperty()
	@ArrayNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => SaleItemDto)
	saleItems: SaleItemDto[]
}
