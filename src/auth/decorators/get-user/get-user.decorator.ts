import {
	ExecutionContext,
	InternalServerErrorException,
	createParamDecorator,
} from '@nestjs/common'

// Prop decorator
export const GetUser = createParamDecorator(
	(data: string, context: ExecutionContext) => {
		const req = context.switchToHttp().getRequest()
		const user = req.user

		if (!user)
			throw new InternalServerErrorException('User not found (request)')

		return !data ? user : user[data]
	},
)
