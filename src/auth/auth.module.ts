import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

// Passport - JWT
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

// External Modules
import { EnvKeys } from 'src/config'
import { UsersModule } from 'src/users/users.module'
import { CommonModule } from 'src/common/common.module'

// This module
import { JwtStrategy } from './strategies'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	imports: [
		ConfigModule,

		PassportModule.register({ defaultStrategy: 'jwt' }),

		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get(EnvKeys.JwtSecret),
				signOptions: {
					expiresIn: '1000h',
				},
			}),
		}),
		CommonModule,

		forwardRef(() => UsersModule),
	],
	exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
