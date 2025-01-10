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
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'

@Entity('categories')
@Index(['name', 'client'], { unique: true })
export class Category {
	@PrimaryGeneratedColumn()
	id: number

	@Column('text')
	name: string

	@Column('text', { nullable: true })
	description: string

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
