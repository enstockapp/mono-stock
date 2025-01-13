import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EnvKeys, JoiValidationSchema } from './config'

import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { CommonModule } from './common/common.module'
import { ClientsModule } from './client/clients.module'
import { SeedModule } from './seed/seed.module'
import { RolesModule } from './roles/roles.module'
import { CategoriesModule } from './categories/categories.module'
import { VariantsModule } from './variants/variants.module'
import { ProductsModule } from './products/products.module'
import { SuppliersModule } from './suppliers/suppliers.module'
import { CustomersModule } from './customers/customers.module'
import { PurchasesModule } from './purchases/purchases.module';

@Module({
	imports: [
		//? Enviroment
		ConfigModule.forRoot({
			// envFilePath: '.env',
			validationSchema: JoiValidationSchema,
		}),

		//? Config Database
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env[EnvKeys.DbHost],
			port: +process.env[EnvKeys.DbPort],
			database: process.env[EnvKeys.DbName],
			username: process.env[EnvKeys.DbUser],
			password: process.env[EnvKeys.DbPassword],
			autoLoadEntities: true,
			synchronize: true, // Debe ser false para prod, sync modificaciones en db
		}),

		//? Other modules
		AuthModule,
		UsersModule,
		CommonModule,
		ClientsModule,
		SeedModule,
		RolesModule,
		CategoriesModule,
		VariantsModule,
		ProductsModule,
		SuppliersModule,
		CustomersModule,
		PurchasesModule,
	],
})
export class AppModule {}
