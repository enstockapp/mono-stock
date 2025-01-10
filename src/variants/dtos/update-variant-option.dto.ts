import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator'

/**
 * DTO to update Variant Option
 * Case 1: name => Create variant option
 * Case 2: id, name => Update variant option
 * Case 3: id => Delete variant option
 * @export
 * @class UpdateVariantOptionDto
 */
export class UpdateVariantOptionDto {
	@ApiProperty()
	@IsOptional()
	@IsInt()
	id?: number

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	name: string
}
