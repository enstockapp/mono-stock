import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
// External modules
import { CommonModule } from 'src/common/common.module'
import { ClientsModule } from 'src/client/clients.module'
// This module
import { User } from './entities'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { RolesModule } from 'src/roles/roles.module'
import { AuthModule } from 'src/auth/auth.module'

@Module({
	providers: [UsersService],
	controllers: [UsersController],
	imports: [
		TypeOrmModule.forFeature([User]),
		ClientsModule,
		CommonModule,
		RolesModule,
		forwardRef(() => AuthModule),
	],
	exports: [UsersService],
})
export class UsersModule {}
