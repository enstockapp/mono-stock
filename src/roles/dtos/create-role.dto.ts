import {
	IsEnum,
	IsInt,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator'
import type { IRole } from '../interfaces'
import { PermissionEnum } from '../enums'

export class CreateRoleDto implements IRole {
	@IsInt()
	@IsPositive()
	id: number

	@IsString()
	name: string

	@IsOptional()
	@IsString()
	description: string

	@IsEnum(PermissionEnum, { each: true })
	permissions?: PermissionEnum[]
}
