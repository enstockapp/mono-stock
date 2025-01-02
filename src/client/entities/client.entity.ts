import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'

import { Currency } from 'src/common'
import { IdentificationType } from '../enums'

@Entity('clients')
export class Client {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column('text')
	name: string

	@Column('text', { nullable: true })
	lastname: string

	@Column({
		name: 'identification_type',
		type: 'enum',
		enum: IdentificationType,
	})
	identificationType: IdentificationType

	@Column('text', { unique: true })
	identification: string

	@Column('text', { unique: true })
	email: string

	@Column({ name: 'phone_number', type: 'text' })
	phoneNumber: string

	@Column('text', { nullable: true })
	direction: string

	@Column({
		name: 'main_currency',
		type: 'enum',
		enum: Currency,
		default: Currency.USD,
	})
	mainCurrency: Currency

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
	createdAt: Date

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamptz',
	})
	updatedAt: Date

	/* Relations */

	/* Functions */

	@BeforeInsert()
	checkFieldsBeforeInsert() {
		this.email = this.email.toLowerCase().trim()
		this.name = this.name.trim()
		if (this.lastname) this.lastname = this.lastname.trim()
		this.identification = this.identification.toUpperCase().trim()
		this.phoneNumber = this.phoneNumber.toUpperCase().trim()
		if (this.direction) this.direction = this.direction.trim()
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate() {
		this.checkFieldsBeforeInsert()
	}
}
