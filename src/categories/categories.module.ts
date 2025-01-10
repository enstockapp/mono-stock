import { Module } from '@nestjs/common'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities'
import { AuthModule } from 'src/auth/auth.module'
import { CommonModule } from 'src/common/common.module'

@Module({
	controllers: [CategoriesController],
	providers: [CategoriesService],
	imports: [TypeOrmModule.forFeature([Category]), AuthModule, CommonModule],
	exports: [CategoriesService],
})
export class CategoriesModule {}
