import { SetMetadata } from '@nestjs/common'

export const META_ROLES = 'roles'

export const RoleProtected = (...args: number[]) =>
	SetMetadata(META_ROLES, args)
