import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { CommonModule } from 'src/common/common.module'
import { VariantsModule } from 'src/variants/variants.module'
import { CategoriesModule } from 'src/categories/categories.module'

import {
	ProductsService,
	ProductVariantsService,
	ProductStocksService,
} from './services'
import { Product, ProductStock, ProductVariant } from './entities'
import { ProductsController } from './products.controller'

@Module({
	controllers: [ProductsController],
	providers: [ProductsService, ProductVariantsService, ProductStocksService],
	imports: [
		TypeOrmModule.forFeature([Product, ProductVariant, ProductStock]),
		AuthModule,
		CategoriesModule,
		CommonModule,
		VariantsModule,
	],
	exports: [ProductsService],
})
export class ProductsModule {}
