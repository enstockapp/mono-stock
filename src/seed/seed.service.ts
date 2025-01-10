import { Injectable } from '@nestjs/common'

import { PermissionsService, RolesService } from 'src/roles'
import { UsersService } from 'src/users'

import {
	RolesDB,
	InitPermissionsDB,
	InitClientsDB,
	InitUsersDB,
	CategoriesDB,
	VariantsDB,
} from './data'
import { Client, ClientsService } from 'src/client'
import { CategoriesService, Category } from 'src/categories'
import { Variant, VariantsService } from 'src/variants'
import { ProductsService } from 'src/products'
import { ProductsDB } from './data/products.seed'
import { getRandomFromArray } from './utils/get-random-from-array.util'

@Injectable()
export class SeedService {
	constructor(
		private readonly categoriesService: CategoriesService,
		private readonly clientsService: ClientsService,
		private readonly permissionsService: PermissionsService,
		private readonly rolesService: RolesService,
		private readonly usersService: UsersService,
		private readonly variantsService: VariantsService,
		private readonly productsService: ProductsService,
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
		const clients = await this.insertClients()
		await this.insertUsers()

		for (const client of clients) {
			const categories = await this.insertCategories(client)
			const variants = await this.insertVariants(client)
			await this.insertProductsUnique(client, getRandomFromArray(categories))
			await this.insertProductsWithVariants(client, variants)
		}

		return {
			status: 200,
			message: 'Seed excecuted successfully',
		}
	}

	private async insertRoles(): Promise<void> {
		const promises = []
		RolesDB.forEach(role => promises.push(this.rolesService.create(role)))
		await Promise.all(promises)
	}

	private async insertPermissions(): Promise<void> {
		const promises = []
		InitPermissionsDB.forEach(role =>
			promises.push(this.permissionsService.create(role)),
		)
		await Promise.all(promises)
	}

	private async insertClients(): Promise<Client[]> {
		const promises = []
		InitClientsDB.forEach(client =>
			promises.push(this.clientsService.create(client)),
		)
		return await Promise.all(promises)
	}
	private async insertUsers(): Promise<void> {
		const promises = []
		InitUsersDB.forEach(user => promises.push(this.usersService.create(user)))
		await Promise.all(promises)
	}

	private async insertCategories(client: Client): Promise<Category[]> {
		const promises = []
		CategoriesDB.forEach(category =>
			promises.push(this.categoriesService.create(category, client)),
		)
		return await Promise.all(promises)
	}

	private async insertVariants(client: Client): Promise<Variant[]> {
		const promises = []
		for (const key in VariantsDB) {
			promises.push(this.variantsService.create(VariantsDB[key], client))
		}
		return await Promise.all(promises)
	}

	private async insertProductsUnique(
		client: Client,
		category: Category,
	): Promise<any> {
		const promises = []
		for (const product of ProductsDB.ProductsUniqueDB) {
			product.product.categoryId = category.id
			promises.push(this.productsService.createUnique(product, client))
		}
		return await Promise.all(promises)
	}

	private async insertProductsWithVariants(
		client: Client,
		variants: Variant[],
	): Promise<any> {
		const promises = []
		for (const product of ProductsDB.ProductsWithVarintsDB) {
			const newItemVariants = product.itemsVariants.map(iv => {
				return {
					...iv,
					optionCombination: [
						getRandomFromArray(variants[0].variantOptions).id,
						getRandomFromArray(variants[1].variantOptions).id,
					],
				}
			})
			product.itemsVariants = newItemVariants
			promises.push(this.productsService.createWithVariants(product, client))
		}
		return await Promise.all(promises)
	}
}
