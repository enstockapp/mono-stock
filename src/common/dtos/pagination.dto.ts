import { ApiProperty } from '@nestjs/swagger'

import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator'

export interface Pagination {
	limit: number
	size: number
	page: number
	offset: number
}

export interface PaginatedResponse {
	page: number
	size: number
	total?: number
	items: any[]
}

export class PaginationDto {
	@ApiProperty({
		default: 0,
		description: 'Page number',
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number) // enableImplicitConversions: true
	page?: number

	@ApiProperty({
		default: 10,
		description: 'How many results do you want per page',
	})
	@IsOptional()
	@IsNumber()
	@IsPositive()
	@Type(() => Number) // enableImplicitConversions: true
	size?: number
}

export const getPagination = (paginationDto: PaginationDto): Pagination => {
	const page = paginationDto.page ? paginationDto.page : 0
	const size = paginationDto.size ? paginationDto.size : 10
	return { size, page, limit: size, offset: page * size }
}
