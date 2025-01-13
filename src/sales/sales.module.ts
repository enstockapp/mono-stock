import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { CommonModule } from 'src/common/common.module'
import { CustomersModule } from 'src/customers/customers.module'
import { ProductsModule } from 'src/products/products.module'

import { SalesService, SaleItemsService } from './services'
import { SalesController } from './sales.controller'
import { Sale } from './entities/sale.entity'
import { SaleItem } from './entities/sale-item.entity'

@Module({
	controllers: [SalesController],
	providers: [SalesService, SaleItemsService],
	imports: [
		TypeOrmModule.forFeature([Sale, SaleItem]),
		AuthModule,
		CommonModule,
		ProductsModule,
		CustomersModule,
	],
	exports: [SalesService],
})
export class SalesModule {}
