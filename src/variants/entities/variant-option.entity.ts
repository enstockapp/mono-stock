import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { Variant } from './variant.entity'

@Entity('variant-options')
@Index(['name', 'variant'], { unique: true })
export class VariantOption {
	@PrimaryGeneratedColumn()
	id: number

	@Column('text')
	name: string

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

	@ManyToOne(() => Variant, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'variant_id' })
	variant: Variant

	/* Functions */

	@BeforeInsert()
	checkFieldsBeforeInsert() {
		this.name = this.name.trim()
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate() {
		this.checkFieldsBeforeInsert()
	}
}
