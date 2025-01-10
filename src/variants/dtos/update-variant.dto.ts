import {
	IsArray,
	IsOptional,
	IsString,
	MinLength,
	ValidateNested,
} from 'class-validator'

import { Type } from 'class-transformer'
import { UpdateVariantOptionDto } from './update-variant-option.dto'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateVariantDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	name?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	description?: string

	@ApiProperty({
		description: `
		Format: [{id?: number, name?: string}]
		* Case 1: name => Create variant option
 		* Case 2: id, name => Update variant option
 		* Case 3: id => Delete variant option
		`,
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateVariantOptionDto)
	options?: UpdateVariantOptionDto[]
}
