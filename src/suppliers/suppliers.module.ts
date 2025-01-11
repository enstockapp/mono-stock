import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CommonModule } from 'src/common/common.module'
import { AuthModule } from 'src/auth/auth.module'

import { SuppliersService } from './suppliers.service'
import { SuppliersController } from './suppliers.controller'
import { Supplier } from './entities'

@Module({
	controllers: [SuppliersController],
	providers: [SuppliersService],
	imports: [TypeOrmModule.forFeature([Supplier]), AuthModule, CommonModule],
	exports: [SuppliersService],
})
export class SuppliersModule {}
