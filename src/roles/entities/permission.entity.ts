import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm'
import type { IPermission } from '../interfaces'
import { Role } from './role.entity'

@Entity('permissions')
export class Permission implements IPermission {
	@PrimaryColumn()
	id: number

	@Column('text', { unique: true })
	name: string

	@Column('text', { nullable: true })
	description: string

	@ManyToMany(() => Role, role => role.permissions)
	roles: Role[]
}
