import { Module } from '@nestjs/common'
import { SeedService } from './seed.service'
import { SeedController } from './seed.controller'
import { UsersModule } from 'src/users/users.module'
import { ClientsModule } from 'src/client/clients.module'
import { RolesModule } from 'src/roles/roles.module'
import { AuthModule } from 'src/auth/auth.module'
import { VariantsModule } from 'src/variants/variants.module'
import { CategoriesModule } from 'src/categories/categories.module'
import { ProductsModule } from 'src/products/products.module'

@Module({
	providers: [SeedService],
	imports: [
		AuthModule,
		CategoriesModule,
		ClientsModule,
		RolesModule,
		UsersModule,
		VariantsModule,
		ProductsModule,
	],
	controllers: [SeedController],
})
export class SeedModule {}
