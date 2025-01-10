import {
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { Variant } from 'src/variants'
import { Product } from './product.entity'

@Entity('product_variants')
@Index(['product', 'variant'], { unique: true })
export class ProductVariant {
	@PrimaryGeneratedColumn()
	id: number

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

	@ManyToOne(() => Product, product => product.variants, {
		onDelete: 'CASCADE',
		cascade: true,
	})
	@JoinColumn({ name: 'product_id' })
	product: Product

	@ManyToOne(() => Variant, { cascade: true, nullable: false })
	@JoinColumn({ name: 'variant_id' })
	variant: Variant
}
