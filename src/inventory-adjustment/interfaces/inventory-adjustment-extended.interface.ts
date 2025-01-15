import { ProductStockExtended } from 'src/products'
import { InventoryAdjustment } from '../entities'

export interface InventoryAdjustmentExtended extends InventoryAdjustment {
	productStock: ProductStockExtended
}
