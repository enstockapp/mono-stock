import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'
import { StockTransactionItemDto } from 'src/common'

export class PurchaseItemDto extends StockTransactionItemDto {
	@ApiProperty({ default: false })
	@IsBoolean()
	updateProductBaseCost: boolean
}
