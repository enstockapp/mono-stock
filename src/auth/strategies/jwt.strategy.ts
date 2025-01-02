import { ExtractJwt, Strategy } from 'passport-jwt'

import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'

import { User } from 'src/users'
import { EnvKeys } from 'src/config'

import { JwtPayload } from '../interfaces'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService,
		configService: ConfigService,
	) {
		super({
			secretOrKey: configService.get(EnvKeys.JwtSecret),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		})
	}

	// Se encarga de suministrar el usuario despues de obtener su id del token
	async validate(payload: JwtPayload): Promise<User> {
		const { id } = payload
		const user = await this.authService.validateUser(id)
		return user
	}
}
