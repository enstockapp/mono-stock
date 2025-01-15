import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsInt, ValidateNested } from 'class-validator'
import { ApiProperty, ApiSchema } from '@nestjs/swagger'

import { ItemVariant } from '../../interfaces'
import { StockDto } from './stock.dto'

@ApiSchema({ name: 'ItemVariantDto' })
export class ItemVariantDto implements ItemVariant {
	@ApiProperty({
		description: 'Array of variant_options.id',
	})
	@ArrayNotEmpty()
	@IsInt({ each: true })
	optionCombination: number[]

	@ApiProperty()
	@ValidateNested()
	@Type(() => StockDto)
	stock: StockDto
}
