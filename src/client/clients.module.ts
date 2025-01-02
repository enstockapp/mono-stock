import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CommonModule } from 'src/common/common.module'

import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'
import { Client } from './entities'
import { AuthModule } from 'src/auth/auth.module'
@Module({
	providers: [ClientsService],
	controllers: [ClientsController],
	imports: [TypeOrmModule.forFeature([Client]), CommonModule, AuthModule],
	exports: [ClientsService],
})
export class ClientsModule {}
