import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateCategoryDto {
	@ApiProperty()
	@IsString()
	@MinLength(1)
	name: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	description?: string
}
