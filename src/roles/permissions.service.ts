import { DeleteResult, In, Repository } from 'typeorm'

import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { HandleErrorAdapter } from 'src/common'

import { Permission } from './entities'
import { CreatePermissionDto } from './dtos'
import { PermissionEnum } from './enums'

@Injectable()
export class PermissionsService {
	private readonly context: string = 'PermissionsService'

	constructor(
		@InjectRepository(Permission)
		private readonly permissionsRepository: Repository<Permission>,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create client
	 * @param createPermissionDto
	 * @returns
	 */
	async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
		const permission = this.permissionsRepository.create(createPermissionDto)

		try {
			await this.permissionsRepository.save(permission)
			return permission
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all permissions
	 * @return {*}  {Promise<Permission[]>}
	 * @memberof PermissionEnum
	 */
	async findAll(): Promise<Permission[]> {
		try {
			return await this.permissionsRepository.find({})
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Find all permissions by id's array
	 * @param ids
	 * @returns
	 */
	async findAllByIds(ids: number[] | PermissionEnum[]): Promise<Permission[]> {
		try {
			return await this.permissionsRepository.findBy({ id: In(ids) })
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Return permission by id
	 * @param id
	 * @returns permission
	 */
	async findOneById(id: number): Promise<Permission> {
		const permission = await this.permissionsRepository.findOneBy({ id })
		if (permission) return permission
		throw new BadRequestException(
			this.errorAdapter.getNotFoundError(
				`Permission with id '${id}' not found`,
			),
		)
	}

	/**
	 * Delete all permissions (don't allow in production)
	 * @return {*}
	 * @memberof PermissionsService
	 */
	async deleteAll(): Promise<DeleteResult> {
		try {
			return await this.permissionsRepository.delete({})
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Transform entity (Permission) to enum (PermissionEnum)
	 * @param {Permission} permission
	 * @return {*}  {PermissionEnum}
	 * @memberof PermissionsService
	 */
	entityToEnum(permission: Permission): PermissionEnum {
		return PermissionEnum[permission.name]
	}

	/**
	 * Transform entities (Permission[]) to enums array (PermissionEnum[])
	 * @param {Permission[]} permissions
	 * @return {*}  {PermissionEnum[]}
	 * @memberof PermissionsService
	 */
	entitiesToEnumArray(permissions: Permission[]): PermissionEnum[] {
		return permissions.map(permission => this.entityToEnum(permission))
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
