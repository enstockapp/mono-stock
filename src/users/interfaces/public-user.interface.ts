import { Client } from 'src/client'
import { PermissionEnum, RoleEnum } from 'src/roles'

export interface PublicUser {
	id: string
	email: string
	name: string
	lastname: string
	clientId: string
	client?: Client
	createdAt?: Date
	updatedAt?: Date
	roles?: RoleEnum[]
	permissions?: PermissionEnum[]
}
