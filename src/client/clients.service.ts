import { DeleteResult, Repository } from 'typeorm'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Client } from './entities'
import { CreateClientDto } from './dtos/create-client.dto'
import { HandleErrorAdapter } from 'src/common'

@Injectable()
export class ClientsService {
	private readonly context: string = 'ClientsService'

	constructor(
		@InjectRepository(Client)
		private readonly clientRepository: Repository<Client>,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create client
	 * @param createClientDto
	 * @returns
	 */
	async create(createClientDto: CreateClientDto): Promise<Client> {
		const client = this.clientRepository.create({ ...createClientDto })

		try {
			await this.clientRepository.save(client)
			return client
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Return full client by id
	 * @param id
	 * @returns client
	 */
	async findOneById(id: string): Promise<Client> {
		const client = await this.clientRepository.findOneBy({ id })
		if (client?.isActive) return client

		this.errorAdapter.throwBadRequestNotFoundError(
			`Client with id '${id}' not found`,
		)
	}

	/**
	 * Return full client by email
	 * @param email
	 * @returns client
	 */
	async findOneByEmail(email: string): Promise<Client> {
		const client = await this.clientRepository.findOne({ where: { email } })
		if (client?.isActive) return client

		this.errorAdapter.throwBadRequestNotFoundError(
			`Client with email '${email}' not found`,
		)
	}

	/**
	 * Delete all clients (don't allow in production)
	 * @return {*}
	 * @memberof ClientsService
	 */
	async deleteAll(): Promise<DeleteResult> {
		try {
			return await this.clientRepository.delete({})
		} catch (error) {
			this.handleDBError(error)
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
