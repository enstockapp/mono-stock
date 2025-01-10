import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateVariantDto {
	@ApiProperty()
	@IsString()
	@MinLength(1)
	name: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	description?: string

	@ApiProperty()
	@ArrayNotEmpty()
	@IsString({ each: true })
	@MinLength(1, { each: true })
	options: string[]
}
