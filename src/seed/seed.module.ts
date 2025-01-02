import { Module } from '@nestjs/common'
import { SeedService } from './seed.service'
import { SeedController } from './seed.controller'
import { UsersModule } from 'src/users/users.module'
import { ClientsModule } from 'src/client/clients.module'
import { RolesModule } from 'src/roles/roles.module'
import { AuthModule } from 'src/auth/auth.module'

@Module({
	providers: [SeedService],
	imports: [RolesModule, UsersModule, ClientsModule, AuthModule],
	controllers: [SeedController],
})
export class SeedModule {}
