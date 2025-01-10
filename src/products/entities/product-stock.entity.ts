import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { Product } from './product.entity'
import { ProductStockType } from '../enums'
import { Status } from 'src/common'

@Entity('product_stocks')
@Index(['product', 'optionCombination'], { unique: true })
export class ProductStock {
	@PrimaryGeneratedColumn()
	id: number

	@Column({
		type: 'enum',
		enum: ProductStockType,
		default: ProductStockType.Unique,
	})
	type: ProductStockType

	@Column({
		type: 'int',
		array: true,
		name: 'option_combination',
		nullable: true,
	})
	optionCombination: number[]

	@Column({ type: 'int', default: 0, name: 'initial_quantity' })
	initialQuantity: number

	@Column('int', { default: 0 })
	quantity: number

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	cost: number

	/*? Status id defined in parent
	 	ProductStockType.Unique => Product.status
		ProductStockType.Child => ProductVariantOption.status
		status: Status
  */
	@Column({
		type: 'enum',
		enum: Status,
		default: Status.Active,
	})
	status: Status

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamptz',
	})
	createdAt: Date

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamptz',
	})
	updatedAt: Date

	/* Relations */

	@ManyToOne(() => Product, product => product.stocks, {
		onDelete: 'CASCADE',
		cascade: true,
	})
	@JoinColumn({ name: 'product_id' })
	product?: Product
}
