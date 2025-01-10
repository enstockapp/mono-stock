import { UseGuards, applyDecorators } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiHeader } from '@nestjs/swagger'

import { RoleEnum } from 'src/roles'

import { UserRoleGuard } from '../../guards'
import { RoleProtected } from '../role-protected/role-protected.decorator'

export function Auth(...roles: RoleEnum[]) {
	return applyDecorators(
		ApiHeader({
			name: 'Authorization',
			description: 'Bearer token',
		}),
		RoleProtected(...roles), // Authorization
		UseGuards(
			AuthGuard(), // Authentication
			UserRoleGuard, // Authorization
		),
	)
}
