import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiQuery } from '@nestjs/swagger'
import { BadRequestException } from '@nestjs/common'

export enum Order {
	ASC = 'ASC',
	DESC = 'DESC',
}

export interface Sorting {
	sort: string
	order: 'ASC' | 'DESC'
}

export class SortingDto {
	@ApiProperty({
		default: 'id',
		description: 'Property by which the results will be sorted',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MinLength(2)
	sort?: string

	@ApiProperty({
		default: Order.ASC,
		description: `Sorting direction. Valid values: ${Order.ASC}, ${Order.DESC}`,
		required: false,
	})
	@IsOptional()
	@IsEnum(Order)
	order?: Order
}

export const getSorting = (
	sortingDto: SortingDto,
	validSortFields: string[],
): Sorting => {
	const order = sortingDto.order === 'ASC' ? 'ASC' : 'DESC'
	const sort = sortingDto.sort
	if (!sort) return { sort: validSortFields[0], order }

	if (!validSortFields.includes(sort))
		throw new BadRequestException(
			`Invalid value for sort. Get '${sort}'. Valid values: ${validSortFields.join(', ')}`,
		)
	return { sort, order }
}

export const ApiSorting = (validSortValues: string[]) => {
	return ApiQuery({
		name: 'sort',
		description: `Valid values: ${validSortValues.join(', ')}`,
		required: false,
	})
}
