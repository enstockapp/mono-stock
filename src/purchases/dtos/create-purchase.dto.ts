import { ApiProperty } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsNumber,
	IsPositive,
	ValidateNested,
} from 'class-validator'
import { CreateStockTransactionDto } from 'src/common'
import { PurchaseItemDto } from './purchase-item.dto'
import { Type } from 'class-transformer'

export class CreatePurchaseDto extends CreateStockTransactionDto {
	@ApiProperty()
	@IsPositive()
	@IsNumber()
	supplierId?: number

	@ApiProperty()
	@ArrayNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => PurchaseItemDto)
	purchaseItems: PurchaseItemDto[]
}
