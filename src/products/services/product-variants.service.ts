import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { HandleErrorAdapter } from 'src/common'

import { Product, ProductVariant } from '../entities'
import { Variant, VariantSummary } from 'src/variants'

@Injectable()
export class ProductVariantsService {
	private readonly context: string = 'ProductVariantsService'

	constructor(
		@InjectRepository(ProductVariant)
		private readonly productVariantsRepository: Repository<ProductVariant>,
		private readonly errorAdapter: HandleErrorAdapter,
	) {}

	/**
	 * Create multiple producVariants
	 * @param {Product} product
	 * @param {(Variant[] | VariantSummary[])} variants
	 * @return {*}  {Promise<ProductVariant[]>}
	 * @memberof ProductVariantsService
	 */
	async createMultiples(
		product: Product,
		variants: Variant[] | VariantSummary[],
	): Promise<ProductVariant[]> {
		try {
			const promises: Promise<ProductVariant>[] = []
			variants.forEach(variant => promises.push(this.create(product, variant)))
			return await Promise.all(promises)
		} catch (error) {
			this.handleDBError(error)
		}
	}

	/**
	 * Create a single ProductVariant
	 * @param {Product} product
	 * @param {(Variant | VariantSummary)} variant
	 * @return {*}  {Promise<ProductVariant>}
	 * @memberof ProductVariantsService
	 */
	async create(
		product: Product,
		variant: Variant | VariantSummary,
	): Promise<ProductVariant> {
		try {
			const productVariant = this.productVariantsRepository.create({
				product,
				variant,
			})
			await this.productVariantsRepository.save(productVariant)
			return productVariant
		} catch (error) {
			this.handleDBError(error)
		}
	}

	private async getValidOptionIdsForProduct(
		productId: number,
	): Promise<number[]> {
		const productVariants = await this.productVariantsRepository.find({
			where: { product: { id: productId } },
			relations: ['variant', 'variant.options'], // Asegurarse de cargar las opciones
		})

		const validOptionIds = productVariants
			.flatMap(productVariant => productVariant.variant.variantOptions)
			.map(option => option.id)

		return validOptionIds
	}

	/**
	 * Handle DBs errors
	 * @param error
	 */
	private handleDBError(error: any): never {
		this.errorAdapter.handleDBErrors(error, this.context)
	}
}
