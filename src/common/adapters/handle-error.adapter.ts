import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common'

export const ErrorsCodes = {
	typeormDuplicateKey: '23505', // Duplicate key in db for unique value
	customNotFound: 'key-not-found',
}

const ErrorsWithCodeAndDetail = [
	ErrorsCodes.typeormDuplicateKey,
	ErrorsCodes.customNotFound,
]

interface CustomError {
	code: string | number
	detail?: string
	message?: string
	error?: any
	status?: number
}

@Injectable()
export class HandleErrorAdapter {
	/**
	 * Create Not Found Error for implement in Exceptions
	 * @param message
	 * @returns CustomError
	 */
	getNotFoundError(message: string): CustomError {
		return this.getCustomErrorObject(ErrorsCodes.customNotFound, message)
	}

	/**
	 * Create CustomError with custom code and detail
	 * @param code
	 * @param detail
	 * @returns CustomError
	 */
	getCustomErrorObject(
		code: string,
		message: string,
		status = 400,
	): CustomError {
		return { code, message, status }
	}

	/**
	 * Handle DB errors
	 * @param error
	 * @param context
	 */
	handleDBErrors(error: any, context: string): never {
		const code = error.code || error.response.code
		// ! Keep this validation order in message
		const message = error.detail || error.response.detail || error.message

		if (ErrorsWithCodeAndDetail.includes(code)) {
			throw new BadRequestException(this.getCustomErrorObject(code, message))
		}

		const logger = new Logger(context)
		logger.error(error)

		throw new InternalServerErrorException('Check server logs')
	}
}
