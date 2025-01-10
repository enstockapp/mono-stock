import { ApiProperty, PartialType } from '@nestjs/swagger'
import { ProductDto } from '../product.dto'
import { Status } from 'src/common'
import { IsEnum, IsOptional } from 'class-validator'

export class UpdateProductDto extends PartialType(ProductDto) {
	@ApiProperty({
		description: `Valid values: ${Status.Active}, ${Status.Inactive}`,
		required: false,
	})
	@IsOptional()
	@IsEnum(Status)
	status?: Status
}
