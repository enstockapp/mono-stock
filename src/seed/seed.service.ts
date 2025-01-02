import { Injectable } from '@nestjs/common'

import { PermissionsService, RolesService } from 'src/roles'
import { UsersService } from 'src/users'

import { RolesDB, InitPermissionsDB, InitClientsDB, InitUsersDB } from './data'
import { ClientsService } from 'src/client'

@Injectable()
export class SeedService {
	constructor(
		private readonly rolesService: RolesService,
		private readonly permissionsService: PermissionsService,
		private readonly clientsService: ClientsService,
		private readonly usersService: UsersService,
	) {}

	/**
	 * Init Seed with superAdmin users, clients, roles and permissions
	 * @returns
	 */
	async initSeed() {
		// Clean tables
		await this.usersService.deleteAll()
		await this.rolesService.deleteAll()
		await this.permissionsService.deleteAll()
		await this.clientsService.deleteAll()

		// Insert init data
		await this.insertPermissions()
		await this.insertRoles()
		await this.insertClients()
		await this.insertUsers()

		return {
			status: 200,
			message: 'Seed excecuted successfully',
		}
	}

	private async insertRoles(): Promise<void> {
		const rolesPromises = []
		RolesDB.forEach(role => rolesPromises.push(this.rolesService.create(role)))
		await Promise.all(rolesPromises)
	}

	private async insertPermissions(): Promise<void> {
		const permissionsPromises = []
		InitPermissionsDB.forEach(role =>
			permissionsPromises.push(this.permissionsService.create(role)),
		)
		await Promise.all(permissionsPromises)
	}

	private async insertClients(): Promise<void> {
		const clientsPromises = []
		InitClientsDB.forEach(client =>
			clientsPromises.push(this.clientsService.create(client)),
		)
		await Promise.all(clientsPromises)
	}
	private async insertUsers(): Promise<void> {
		const usersPromises = []
		InitUsersDB.forEach(user =>
			usersPromises.push(this.usersService.create(user)),
		)
		await Promise.all(usersPromises)
	}
}
