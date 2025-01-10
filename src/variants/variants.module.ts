import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { CommonModule } from 'src/common/common.module'

import { Variant, VariantOption } from './entities'
import { VariantsService, VariantOptionsService } from './services'
import { VariantsController } from './variants.controller'

@Module({
	controllers: [VariantsController],
	providers: [VariantsService, VariantOptionsService],
	imports: [
		TypeOrmModule.forFeature([Variant, VariantOption]),
		AuthModule,
		CommonModule,
	],
	exports: [VariantsService],
})
export class VariantsModule {}
