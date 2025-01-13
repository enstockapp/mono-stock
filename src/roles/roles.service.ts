import { DeleteResult, In, Repository } from 'typeorm'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { HandleErrorAdapter } from 'src/common'

import { Role } from './entities'
import { CreateRoleDto } from './dtos'
import { RoleEnum } from './enums'
import { PermissionsService } from './permissions.service'

@Injectable()
export class RolesService {
	private readonly context: string = 'RolesService'

	constructor(
		@InjectRepository(Role)
		private readonly rolesRepository: Repository<Role>,
		private readonly errorAdapter: HandleErrorAdapter,
		private readonly permissionsService: PermissionsService,
	) {}

	/**
	 * Create client
	 * @param createRoleDto
	 * @returns
	 */
	async create(createRoleDto: CreateRoleDto): Promise<Role> {
		const { permissions, ...roleData } = createRoleDto

		try {
			// Validate if all roles exists
			const permissionsFull =
				await this.permissionsService.findAllByIds(permissions)

			const role = this.rolesRepository.create({
				...roleData,
				permissions: permissionsFull,
			})
			await this.rolesRepository.save(role)
			return role
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all roles
	 * @return {*}  {Promise<Role[]>}
	 * @memberof RolesService
	 */
	async findAll(): Promise<Role[]> {
		try {
			return await this.rolesRepository.find({})
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all roles by id's array
	 * @param ids
	 * @returns
	 */
	async findAllByIds(ids: number[] | RoleEnum[]): Promise<Role[]> {
		try {
			return await this.rolesRepository.findBy({ id: In(ids) })
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Return role by id
	 * @param id
	 * @returns role
	 */
	async findOneById(id: number): Promise<Role> {
		const role = await this.rolesRepository.findOneBy({ id })
		if (role) return role
		this.errorAdapter.throwBadRequestNotFoundError(
			`Role with id '${id}' not found`,
		)
	}

	/**
	 * Delete all roles (don't allow in production)
	 * @return {*}
	 * @memberof RolesService
	 */
	async deleteAll(): Promise<DeleteResult> {
		try {
			return await this.rolesRepository.delete({})
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Transform entity (Role) to enum (RoleEnum)
	 * @param {Role} role
	 * @return {*}  {RoleEnum}
	 * @memberof RolesService
	 */
	entityToEnum(role: Role): RoleEnum {
		return RoleEnum[role.name]
	}

	/**
	 * Transform entities (Role[]) to enums array (RoleEnum[])
	 * @param {Role[]} roles
	 * @return {*}  {RoleEnum[]}
	 * @memberof RolesService
	 */
	entitiesToEnumArray(roles: Role[]): RoleEnum[] {
		return roles.map(role => this.entityToEnum(role))
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
