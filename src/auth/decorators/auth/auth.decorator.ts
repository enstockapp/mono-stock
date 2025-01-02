import { UseGuards, applyDecorators } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { RoleEnum } from 'src/roles'
import { RoleProtected } from '../role-protected/role-protected.decorator'
import { UserRoleGuard } from 'src/auth/guards'
export function Auth(...roles: RoleEnum[]) {
	return applyDecorators(
		RoleProtected(...roles), // Authorization
		UseGuards(
			AuthGuard(), // Authentication
			UserRoleGuard, // Authorization
		),
	)
}
