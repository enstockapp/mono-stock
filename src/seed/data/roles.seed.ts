import { CreateRoleDto, RoleEnum } from 'src/roles'
import {
	DEFAULT_PERMISSIONS_ADMIN,
	DEFAULT_PERMISSIONS_USER,
} from 'src/roles/consts'

export const RolesDB: CreateRoleDto[] = [
	{
		id: RoleEnum.superAdmin,
		name: RoleEnum[RoleEnum.superAdmin],
		description: 'Creator of clients and users',
		permissions: DEFAULT_PERMISSIONS_ADMIN,
	},
	{
		id: RoleEnum.admin,
		name: RoleEnum[RoleEnum.admin],
		description:
			"Full access to the platform's functionalities for the same client. Ideal for owners.",
		permissions: DEFAULT_PERMISSIONS_ADMIN,
	},
	{
		id: RoleEnum.user,
		name: RoleEnum[RoleEnum.user],
		description:
			"Partial access to the platform's features. Ideal for employees.",
		permissions: DEFAULT_PERMISSIONS_USER,
	},
]
