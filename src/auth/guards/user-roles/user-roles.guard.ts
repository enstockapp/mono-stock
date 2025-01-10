import { Observable } from 'rxjs'

import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { User } from 'src/users'

import { META_ROLES } from 'src/auth/decorators'

@Injectable()
export class UserRoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToHttp().getRequest()
		const user = req.user as User

		if (!user) throw new BadRequestException('User not found')

		const validRoles: number[] = this.reflector.get(
			META_ROLES,
			context.getHandler(),
		)

		// En caso que no tenga la metadata, se permite el acceso
		if (!validRoles || validRoles.length === 0) return true

		for (const role of user.roles) if (validRoles.includes(role.id)) return true

		throw new ForbiddenException(
			`User ${user.name} need a valid role. Valid roles: [${validRoles}]`,
		)
	}
}
