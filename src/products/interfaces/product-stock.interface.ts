import { Product, ProductStock } from '../entities'

export interface ProductStockExtended extends ProductStock {
	product?: Product
	productId: number
	fullName?: string // Product.name + options names
	nameSuffix: string // Only options name
}
