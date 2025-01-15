import { Module } from '@nestjs/common'
import { InventoryAdjustmentService } from './inventory-adjustment.service'
import { InventoryAdjustmentController } from './inventory-adjustment.controller'
import { ProductsModule } from 'src/products/products.module'
import { CommonModule } from 'src/common/common.module'
import { AuthModule } from 'src/auth/auth.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InventoryAdjustment } from './entities'

@Module({
	controllers: [InventoryAdjustmentController],
	providers: [InventoryAdjustmentService],
	imports: [
		TypeOrmModule.forFeature([InventoryAdjustment]),
		AuthModule,
		CommonModule,
		ProductsModule,
	],
	exports: [InventoryAdjustmentService],
})
export class InventoryAdjustmentModule {}
