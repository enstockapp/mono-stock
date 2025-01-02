import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'

const prefix = 'api'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const logger = new Logger('Bootstrap')

	app.setGlobalPrefix(prefix)

	// Pipes
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	)

	// Swagger
	const config = new DocumentBuilder()
		.setTitle('Mono Stock RESTFul API')
		.setDescription('Mono-stock repo endpoints')
		.setVersion('1.0')
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup(prefix, app, document)

	// Port
	const port = process.env.PORT
	await app.listen(port)
	logger.log(`App running in port: ${port}`)
}
bootstrap()
