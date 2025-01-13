import { IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FilteringDto {
	@ApiProperty({
		required: false,
	})
	@IsOptional()
	@IsString()
	searchTerm?: string
}
