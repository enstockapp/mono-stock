import { MeasureUnitType } from 'src/common'

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
