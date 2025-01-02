import { DeleteResult, Repository } from 'typeorm'

import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { PermissionsService, RolesService } from 'src/roles'
import { EncryptAdapter, HandleErrorAdapter } from 'src/common'
import { ClientsService } from 'src/client'

import { CreateUserDto } from './dtos'
import { User } from './entities'
import { PublicUser } from './interfaces'

@Injectable()
export class UsersService {
	private readonly context: string = 'UsersService'

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly clientService: ClientsService,
		private readonly rolesService: RolesService,
		private readonly permissionsService: PermissionsService,
		private readonly encryptAdapter: EncryptAdapter,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create user
	 * @param createUserDto
	 * @returns user
	 */
	async create(createUserDto: CreateUserDto): Promise<User> {
		const { email, password, clientId, roles, ...userData } = createUserDto

		try {
			// Validate if client exist
			const client = await this.clientService.findOneById(clientId)

			// Validate if all roles exists
			const rolesFull = await this.rolesService.findAllByIds(roles)

			// Encrypt password
			const encryptedPassword = this.encryptAdapter.hashSync(password)

			const user = this.userRepository.create({
				...userData,
				email: email.toLowerCase(),
				password: encryptedPassword,
				client: client,
				roles: rolesFull,
			})

			await this.userRepository.save(user)
			delete user.password

			return user
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Return full user by id
	 * @param id
	 * @returns user
	 */
	async findOneById(
		id: string,
		publicUser = false,
	): Promise<User | PublicUser> {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ['roles', 'roles.permissions'],
		})
		if (user?.isActive) {
			if (!publicUser) return user
			return this.transformUserInPublicUser(user)
		}
		throw new BadRequestException(
			this.errorAdapter.getNotFoundError(`User with id '${id}' not found`),
		)
	}

	/**
	 * Return full user by id
	 * @param email
	 * @returns user
	 */
	async findOneByEmail(email: string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { email },
			relations: ['roles', 'roles.permissions'],
		})
		if (user?.isActive) return user
		throw new BadRequestException(
			this.errorAdapter.getNotFoundError(
				`User with email '${email}' not found`,
			),
		)
	}

	/**
	 * Delete all users (don't allow in production)
	 * @return {*}
	 * @memberof UsersService
	 */
	async deleteAll(): Promise<DeleteResult> {
		try {
			return await this.userRepository.delete({})
		} catch (error) {
			this.handleDBError(error)
		}
	}

	transformUserInPublicUser(user: User): PublicUser {
		const roles = user.roles
		const permissions = []

		roles.forEach(role => {
			permissions.push(...role.permissions)
		})

		return {
			...user,
			roles: this.rolesService.entitiesToEnumArray(roles),
			permissions: this.permissionsService.entitiesToEnumArray(permissions),
		}
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
