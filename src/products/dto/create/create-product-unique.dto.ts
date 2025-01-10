import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

import { ProductUnique } from '../../interfaces'
import { StockDto } from './stock.dto'
import { ProductDto } from '../product.dto'
import { ValidateNested } from 'class-validator'

export class CreateProductUniqueDto implements ProductUnique {
	@ApiProperty()
	@ValidateNested()
	@Type(() => ProductDto)
	product: ProductDto

	@ApiProperty()
	@ValidateNested()
	@Type(() => StockDto)
	stock: StockDto
}
