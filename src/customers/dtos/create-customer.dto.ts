import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MinLength } from 'class-validator'
import { CreateContactDto } from 'src/common'

export class CreateCustomerDto extends CreateContactDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(1)
	lastname: string
}
