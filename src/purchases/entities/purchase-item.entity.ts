import { StockTransactionItem } from 'src/common'
import { ProductStock } from 'src/products'
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { Purchase } from './purchase.entity'

@Entity('purchase_items')
export class PurchaseItem implements StockTransactionItem {
	@PrimaryGeneratedColumn()
	id: number

	@Column('int')
	quantity: number

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	amount: number

	@Column('boolean', { default: true })
	updateProductBaseCost: boolean

	@Column({
		name: 'is_active',
		type: 'boolean',
		default: true,
	})
	isActive: boolean

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamptz',
	})
	createdAt?: Date

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamptz',
	})
	updatedAt?: Date

	/* Relations */

	@ManyToOne(() => ProductStock, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'product_stock_id' })
	productStock?: ProductStock

	productStockId?: number

	@ManyToOne(() => Purchase, purchase => purchase.purchaseItems, {
		onDelete: 'CASCADE',
		cascade: true,
	})
	@JoinColumn({ name: 'purchase_id' })
	purchase?: Purchase

	purchaseId?: number
}
