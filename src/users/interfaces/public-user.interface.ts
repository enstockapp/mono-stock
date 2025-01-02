import { PermissionEnum, RoleEnum } from 'src/roles'

export interface PublicUser {
	id: string
	email: string
	name: string
	lastname: string
	// client:
	createdAt?: Date
	updatedAt?: Date
	roles?: RoleEnum[]
	permissions?: PermissionEnum[]
}
