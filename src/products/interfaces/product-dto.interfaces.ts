import { Status } from 'src/common'
import { IProduct } from './product.interface'

export interface Stock {
	initialQuantity?: number
	// quantity?: number
	// cost?: number
	status?: Status
}

// ? Product Unique

export interface ProductUnique {
	product: IProduct
	stock: Stock
}

// ? Product with variants

export interface ProductWithVariants {
	product: IProduct
	// variantsIds: number[]
	itemsVariants: ItemsVariants[]
}

export interface ItemsVariants {
	optionCombination: number[]
	stock?: Stock
	status?: Status
}
