import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm'
import { User } from 'src/users/entities/user.entity' //! Keep this import format
import type { IRole } from '../interfaces'
import { Permission } from './permission.entity'

@Entity('roles')
export class Role implements IRole {
	@PrimaryColumn()
	id: number

	@Column('text', { unique: true })
	name: string

	@Column('text', { select: false })
	description: string

	@ManyToMany(() => User, user => user.roles)
	users: User[]

	@ManyToMany(() => Permission, { onDelete: 'CASCADE' })
	@JoinTable({
		name: 'role_permissions',
		joinColumn: { name: 'role_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
	})
	permissions: Permission[]
}
