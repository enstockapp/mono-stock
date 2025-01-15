import { MeasureUnitType } from 'src/common'
import { ProductStockExtended } from './product-stock.interface'
import { Product } from '../entities'

/**
 *
 * @param {Product.id} id
 * @export
 * @interface IProduct
 */
export interface IProduct {
	id?: number
	reference?: string
	name: string
	description?: string
	unitType: MeasureUnitType
	baseCost: number
	price: number
	metadata?: Record<string, any>
	categoryId?: number
}

export interface ProductExtended extends Product {
	stock: ProductStockExtended
}
