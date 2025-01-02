import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'

import { Client } from 'src/client'
import { Role } from 'src/roles/entities/role.entity' //! Keep this import format

import { Status } from '../enums'

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column('text', { unique: true })
	email: string

	@Column('text')
	password: string

	@Column('text')
	name: string

	@Column('text', { nullable: true })
	lastname: string

	@Column({
		type: 'enum',
		enum: Status,
		default: Status.active,
	})
	status: Status

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

	@ManyToOne(() => Client, { nullable: false })
	@JoinColumn({ name: 'client_id' })
	client: Client

	@ManyToMany(() => Role, role => role.users, { onDelete: 'CASCADE' })
	@JoinTable({
		name: 'user_roles',
		joinColumn: { name: 'user_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
	})
	roles: Role[]

	/* Functions */

	@BeforeInsert()
	checkFieldsBeforeInsert() {
		this.email = this.email.toLowerCase().trim()
		this.name = this.name.trim()
		if (this.lastname) this.lastname = this.lastname.trim()
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate() {
		this.checkFieldsBeforeInsert()
	}
}
