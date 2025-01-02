import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator'
import type { IPermission } from '../interfaces'

export class CreatePermissionDto implements IPermission {
	@IsInt()
	@IsPositive()
	id: number

	@IsString()
	name: string

	@IsOptional()
	@IsString()
	description: string
}
