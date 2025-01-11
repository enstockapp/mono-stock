import { IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FilteringDto {
	@ApiProperty({
		description: 'Term for search in name, description, reference',
		required: false,
	})
	@IsOptional()
	@IsString()
	searchTerm?: string
}
