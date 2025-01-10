import {
	IsEnum,
	IsInt,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator'
import type { IRole } from '../interfaces'
import { PermissionEnum } from '../enums'
import { ApiProperty } from '@nestjs/swagger'

export class CreateRoleDto implements IRole {
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

	@ApiProperty()
	@IsEnum(PermissionEnum, { each: true })
	permissions?: PermissionEnum[]
}
