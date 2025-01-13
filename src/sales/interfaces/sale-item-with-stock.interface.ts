import { Product, ProductStock } from 'src/products'
import { Client } from 'src/client'
import { SaleItemDto } from '../dtos'
import { Sale, SaleItem } from '../entities'

export interface SaleItemWithStock {
	client: Client
	saleItemDto: SaleItemDto | SaleItem
	productStock: ProductStock
	product: Product
	sale?: Sale
}
