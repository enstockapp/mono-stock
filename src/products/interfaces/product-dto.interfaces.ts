import { Status } from 'src/common'
import { IProduct } from './product.interface'
import { ItemVariantDto } from '../dto'

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
	itemsVariants: ItemVariant[]
}

export interface ItemVariant {
	optionCombination: number[]
	stock?: Stock
}

export interface ItemVariantDtoExtended extends ItemVariantDto {
	metadata: Record<string | number, any>
}
