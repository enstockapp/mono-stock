import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { CommonModule } from 'src/common/common.module'
import { SuppliersModule } from 'src/suppliers/suppliers.module'
import { ProductsModule } from 'src/products/products.module'

import { PurchasesService, PurchaseItemsService } from './services'
import { PurchasesController } from './purchases.controller'
import { Purchase } from './entities/purchase.entity'
import { PurchaseItem } from './entities/purchase-item.entity'

@Module({
	controllers: [PurchasesController],
	providers: [PurchasesService, PurchaseItemsService],
	imports: [
		TypeOrmModule.forFeature([Purchase, PurchaseItem]),
		AuthModule,
		CommonModule,
		ProductsModule,
		SuppliersModule,
	],
	exports: [PurchasesService],
})
export class PurchasesModule {}
