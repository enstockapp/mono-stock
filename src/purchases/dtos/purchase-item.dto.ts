import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsPositive } from 'class-validator'
import { StockTransactionItemDto } from 'src/common'

export class PurchaseItemDto extends StockTransactionItemDto {
	@ApiProperty({
		description: 'maxDecimalPlaces: 2',
	})
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsPositive()
	amount: number

	@ApiProperty({ default: false })
	@IsBoolean()
	updateProductBaseCost: boolean
}
