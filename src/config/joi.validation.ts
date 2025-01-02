// import Joi from 'joi' //-> No funciona
import * as Joi from 'joi' //-> Si funciona
import { EnvKeys } from './env-keys'

export const JoiValidationSchema = Joi.object({
	[EnvKeys.State]: Joi.string().default('dev'), // dev, prod
	[EnvKeys.Port]: Joi.number().default(3000),
	[EnvKeys.DbName]: Joi.required(),
	[EnvKeys.DbPassword]: Joi.required(),
	[EnvKeys.DbHost]: Joi.string().default('localhost'),
	[EnvKeys.DbPort]: Joi.number().default(5432),
	[EnvKeys.DbUser]: Joi.string().default('postgres'),
	[EnvKeys.JwtSecret]: Joi.required(),
})
