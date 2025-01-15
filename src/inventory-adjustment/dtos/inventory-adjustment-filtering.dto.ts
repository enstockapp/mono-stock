import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { Currency, DocumentType, FilteringDto } from 'src/common'
import { AdjustmentType } from '../enums'

export interface InventoryAdjustmentsFiltering extends FilteringDto {
	documentType?: DocumentType
	currency?: Currency
}

export class InventoryAdjustmentsFilteringDto extends FilteringDto {
	@ApiProperty({
		description: `Filter all with specific documentType. Valid values: ${Object.values(DocumentType).join(', ')}`,
		required: false,
	})
	@IsOptional()
	@IsEnum(AdjustmentType)
	adjustmentType: AdjustmentType
}

export const getInventoryAdjustmentsFiltering = (
	inventoryAdjustmentFilteringDto: InventoryAdjustmentsFilteringDto,
): InventoryAdjustmentsFilteringDto => {
	return {
		...inventoryAdjustmentFilteringDto,
	}
}
