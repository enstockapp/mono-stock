import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
// External modules
import { CreateUserDto, User, UsersService } from 'src/users'
// This module
import { AuthResponse } from './interfaces'
import { LoginUserDto } from './dtos'
import { EncryptAdapter, HandleErrorAdapter } from 'src/common'

@Injectable()
export class AuthService {
	private readonly context: string = 'AuthService'

	constructor(
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
		private readonly encrypt: EncryptAdapter,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create user and return user with token
	 * @param {CreateUserDto} createUserDto
	 * @return {*}  {Promise<AuthResponse>}
	 * @memberof AuthService
	 */
	async create(createUserDto: CreateUserDto): Promise<AuthResponse> {
		try {
			const user = await this.usersService.create(createUserDto)
			return this.transformUserInAuthResponse(user)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Login user with email and password
	 * @param {LoginUserDto} loginUserDto
	 * @return {*}  {Promise<AuthResponse>}
	 * @memberof AuthService
	 */
	async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
		const { password, email } = loginUserDto

		const user = await this.usersService.findOneByEmail(email)

		if (!user)
			throw new UnauthorizedException('Credentials are not valid (email)')
		if (!this.encrypt.compareSync(password, user.password))
			throw new UnauthorizedException('Credentials are not valid (password)')
		return this.transformUserInAuthResponse(user)
	}

	/**
	 * Check user status and get new token
	 * @param {User} user
	 * @return {*} {Promise<AuthResponse>}
	 * @memberof AuthService
	 */
	async checkAuthStatus(user: User): Promise<AuthResponse> {
		return this.transformUserInAuthResponse(user)
	}

	/**
	 * Validate if exists an active user by id
	 * @param userId
	 * @returns user
	 */
	async validateUser(userId: string): Promise<User> {
		const user = (await this.usersService.findOneById(userId)) as User
		if (!user.isActive)
			throw new UnauthorizedException('User is inactive, talk with admin')

		user.password = undefined
		return user
	}

	/**
	 * Transform a valid user in AuthReponse
	 * @param user
	 * @returns { PublicUser, token }
	 */
	private transformUserInAuthResponse(user: User): AuthResponse {
		const publicUser = this.usersService.transformUserInPublicUser(user)
		const token = this.getJwtToken(user)
		return { user: publicUser, token }
	}

	/**
	 * Generate a token
	 * @param user
	 * @returns token
	 */
	private getJwtToken(user: User): string {
		return this.jwtService.sign({ id: user.id })
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
