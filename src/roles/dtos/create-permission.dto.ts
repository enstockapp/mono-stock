import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import type { IPermission } from '../interfaces'

export class CreatePermissionDto implements IPermission {
	@ApiProperty()
	@IsInt()
	@IsPositive()
	id: number

	@ApiProperty()
	@IsString()
	name: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	description: string
}
