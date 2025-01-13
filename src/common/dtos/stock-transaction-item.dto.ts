import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsPositive } from 'class-validator'

export class StockTransactionItemDto {
	@ApiProperty()
	@IsNumber()
	@IsPositive()
	productStockId: number

	@ApiProperty()
	@IsNumber()
	@IsPositive()
	quantity: number
}
