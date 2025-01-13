import { Product, ProductStock } from 'src/products'
import { Client } from 'src/client'
import { PurchaseItemDto } from '../dtos'
import { Purchase, PurchaseItem } from '../entities'

export interface PurchaseItemWithStock {
	client: Client
	purchaseItemDto: PurchaseItemDto | PurchaseItem
	productStock: ProductStock
	product: Product
	purchase?: Purchase
}
