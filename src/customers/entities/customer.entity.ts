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
import { Contact } from 'src/common'
import { Client } from 'src/client/entities/client.entity' //! Keep this import
import { IdentificationType } from 'src/client'

@Entity('customers')
@Index(['name', 'client'], { unique: true })
export class Customer implements Contact {
	@PrimaryGeneratedColumn()
	id: number

	@Column('text')
	name: string

	@Column({
		name: 'identification_type',
		type: 'enum',
		enum: IdentificationType,
		nullable: true,
	})
	identificationType?: IdentificationType

	@Column('text', { nullable: true })
	identification?: string

	@Column('text', { nullable: true })
	phoneNumber?: string

	@Column('text', { nullable: true })
	email?: string

	@Column('text', { nullable: true })
	direction?: string

	@Column('text', { nullable: true })
	notes?: string

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

	@ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'client_id' })
	client: Client

	clientId?: string

	/* Functions */

	@BeforeInsert()
	checkFieldsBeforeInsert() {
		this.name = this.name.trim()
		this.identification = this.identification.trim()
		if (this.phoneNumber) this.phoneNumber = this.phoneNumber.trim()
		if (this.email) this.email = this.email.trim()
		if (this.direction) this.direction = this.direction.trim()
		if (this.notes) this.notes = this.notes.trim()
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate() {
		this.checkFieldsBeforeInsert()
	}
}
