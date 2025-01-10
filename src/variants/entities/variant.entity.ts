import { Client } from 'src/client'
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
import { VariantOption } from './variant-option.entity'

@Entity('variants')
@Index(['name', 'client'], { unique: true })
export class Variant {
	@PrimaryGeneratedColumn()
	id: number

	@Column('text')
	name: string

	@Column('text', { nullable: true })
	description: string

	@Column({ type: 'boolean', default: true, name: 'can_edit' })
	canEdit: boolean

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

	@ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'client_id' })
	client: Client

	clientId?: string

	@OneToMany(() => VariantOption, variantOption => variantOption.variant)
	variantOptions: VariantOption[]

	/* Functions */

	@BeforeInsert()
	checkFieldsBeforeInsert() {
		this.name = this.name.trim()
		if (this.description) this.description = this.description.trim()
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate() {
		this.checkFieldsBeforeInsert()
	}
}
