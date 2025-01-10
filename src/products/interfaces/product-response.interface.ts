import { Product, ProductStock, ProductVariant } from '../entities'
import { ProductStockExtended } from './product-stock.interface'

export interface ProductResponse {
	product: Product
	productVariant: ProductVariant[]
	productStock: ProductStock[] | ProductStockExtended[]
}
