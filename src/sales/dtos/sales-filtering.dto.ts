import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { Currency, DocumentType, FilteringDto } from 'src/common'

export interface SalesFiltering extends FilteringDto {
	documentType?: DocumentType
	currency?: Currency
}

export class SalesFilteringDto extends FilteringDto {
	@ApiProperty({
		description: `Filter all with specific documentType. Valid values: ${Object.values(DocumentType).join(', ')}`,
		required: false,
	})
	@IsOptional()
	@IsEnum(DocumentType)
	documentType?: DocumentType

	@ApiProperty({
		description: `Filter all with specific Currency. Valid values: ${Object.values(Currency).join(', ')}`,
		required: false,
	})
	@IsOptional()
	@IsEnum(Currency)
	currency?: Currency
}

export const getSalesFiltering = (salesFilteringDto: SalesFilteringDto) => {
	return {
		...salesFilteringDto,
	}
}
