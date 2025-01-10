import { Category } from 'src/categories'
import { Client } from 'src/client'
import { MeasureUnitType, Status } from 'src/common'
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { ProductVariant } from './product-variant.entity'
import { ProductStock } from './product-stock.entity'
import { ProductType } from '../enums'
import { IProduct } from '../interfaces'

@Entity('products')
@Index(['reference', 'name', 'client'], { unique: true })
export class Product implements IProduct {
	@PrimaryGeneratedColumn()
	id: number

	@Column({
		type: 'enum',
		enum: ProductType,
		default: ProductType.Unique,
	})
	type: ProductType

	@Column('text', { nullable: true })
	reference: string

	@Column('text')
	name: string

	@Column('text', { nullable: true })
	description: string

	@Column({
		type: 'enum',
		enum: MeasureUnitType,
		default: MeasureUnitType.Unit,
		name: 'unit_type',
	})
	unitType: MeasureUnitType

	@Column({
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0,
		name: 'base_cost',
	})
	baseCost: number

	@Column({
		type: 'decimal',
		precision: 10,
		scale: 2,
		default: 0,
		name: 'average_cost',
	})
	averageCost: number

	@Column({ type: 'int', default: 0, name: 'total_for_average_cost' })
	totalForAverageCost: number

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	price: number

	@Column('jsonb', { default: '{}' })
	metadata: Record<string, any>

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

	@ManyToOne(() => Category, { nullable: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'category_id' })
	category?: Category

	categoryId?: number

	@ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'client_id' })
	client: Client

	clientId?: string

	@OneToMany(() => ProductVariant, variant => variant.product, {
		nullable: true,
	})
	variants?: ProductVariant[]

	@OneToMany(() => ProductStock, stock => stock.product)
	stocks: ProductStock[]

	/* Functions */

	@BeforeInsert()
	checkFieldsBeforeInsert() {
		this.name = this.name.trim()
		if (this.reference) this.reference = this.reference.toUpperCase().trim()
		if (this.description) this.description = this.description.trim()
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate() {
		this.checkFieldsBeforeInsert()
	}
}
