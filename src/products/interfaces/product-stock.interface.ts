import { VariantOption } from 'src/variants'
import { Product, ProductStock } from '../entities'

export interface ProductStockExtended extends ProductStock {
	product?: Product
	optionCombinationFull: VariantOption[]
	productId: number
}
