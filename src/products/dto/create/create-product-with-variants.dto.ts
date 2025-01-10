import {
	ArrayNotEmpty,
	// IsArray,
	// IsInt,
	// IsNotEmpty,
	// IsPositive,
	ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

import { ProductWithVariants } from '../../interfaces'
import { ProductDto } from '../product.dto'
import { ItemVariantDto } from './item-variants.dto'
import { ApiProperty } from '@nestjs/swagger'

export class CreateProductWithVariantsDto implements ProductWithVariants {
	@ApiProperty()
	@ValidateNested()
	@Type(() => ProductDto)
	product: ProductDto

	@ApiProperty()
	@ArrayNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => ItemVariantDto)
	itemsVariants: ItemVariantDto[]
}
