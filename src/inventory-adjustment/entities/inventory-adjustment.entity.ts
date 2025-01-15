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
import { AdjustmentType } from '../enums'
import { User } from 'src/users'

@Entity('inventory_adjustment')
export class InventoryAdjustment {
	@PrimaryGeneratedColumn()
	id: number

	@Column({
		name: 'adjustment_type',
		type: 'enum',
		enum: AdjustmentType,
	})
	adjustmentType: AdjustmentType

	@Column('int')
	quantity: number

	@Column('jsonb', { default: '{}' })
	metadata?: Record<string, any>

	@Column('text')
	comment: string

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

	@ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User

	userId?: number
}
