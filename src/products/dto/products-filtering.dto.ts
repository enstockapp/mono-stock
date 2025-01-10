import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { FilteringDto, Status } from 'src/common'

export interface ProductsFiltering extends FilteringDto {
	status: Status
}

export class ProductsFilteringDto extends FilteringDto {
	@ApiProperty({
		description: 'Filter all with status: active',
		required: false,
		default: true,
	})
	@IsOptional()
	@IsBoolean()
	statusActive?: boolean
}

export const getProductsFiltering = (
	productsFilteringDto: ProductsFilteringDto,
) => {
	const { statusActive = true } = productsFilteringDto
	return {
		...productsFilteringDto,
		status: statusActive ? Status.Active : Status.Inactive,
	}
}
