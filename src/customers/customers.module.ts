import { Module } from '@nestjs/common'
import { CustomersService } from './customers.service'
import { CustomersController } from './customers.controller'
import { Customer } from './entities/customer.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from 'src/auth/auth.module'
import { CommonModule } from 'src/common/common.module'

@Module({
	controllers: [CustomersController],
	providers: [CustomersService],
	imports: [TypeOrmModule.forFeature([Customer]), AuthModule, CommonModule],
	exports: [CustomersService],
})
export class CustomersModule {}
