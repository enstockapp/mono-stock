import { IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FilteringDto {
	// @ApiProperty({
	// 	default: 'id',
	// 	description: 'Property by which the results will be sorted',
	// 	required: false,
	// })
	// @IsOptional()
	// @IsString()
	// @MinLength(2)
	// filterBy?: string

	@ApiProperty({
		description: 'Term for search in name, description, reference',
		required: false,
	})
	@IsOptional()
	@IsString()
	searchTerm?: string
}
