import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common'

interface CustomError {
	code: string | number
	detail?: string
	message?: string
	error?: any
	status?: number
}

const ErrorsCodes = {
	typeormDuplicateKey: '23505', // Duplicate key in db for unique value
	typeormNotNullContraint: '23502', // null value in column * of relation * violates not-null constraint
	customDuplicateKey: 'key-duplicate',
	customNotFound: 'key-not-found',
	customValidationError: 'validation-error',
}

const ErrorsWithCodeAndDetail = [
	ErrorsCodes.typeormDuplicateKey,
	ErrorsCodes.typeormNotNullContraint,
	ErrorsCodes.customDuplicateKey,
	ErrorsCodes.customNotFound,
	ErrorsCodes.customValidationError,
]

@Injectable()
export class HandleErrorAdapter {
	/**
	 * Create Not Found Error for implement in Exceptions
	 * @param {string} message
	 * @returns CustomError
	 * @memberof HandleErrorAdapter
	 */
	getNotFoundError(message: string): CustomError {
		return this.getCustomErrorObject(ErrorsCodes.customNotFound, message)
	}

	/**
	 * Create Duplicate Key Error for implement in Exceptions
	 * @param {string} message
	 * @returns CustomError
	 * @memberof HandleErrorAdapter
	 */
	getDuplicateKeyError(message: string): CustomError {
		return this.getCustomErrorObject(ErrorsCodes.customDuplicateKey, message)
	}

	/**
	 * Create Validation Error for implement in Exceptions
	 * @param {string} message
	 * @return {*}  {CustomError}
	 * @memberof HandleErrorAdapter
	 */
	getValidationError(message: string): CustomError {
		return this.getCustomErrorObject(ErrorsCodes.customValidationError, message)
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
		const code = error?.code || error?.response?.code
		// ! Keep this validation order in message
		const message = error?.detail || error?.response?.detail || error?.message

		if (ErrorsWithCodeAndDetail.includes(code)) {
			throw new BadRequestException(this.getCustomErrorObject(code, message))
		}

		const logger = new Logger(context)
		logger.error(error)
		console.log({ error })

		throw new InternalServerErrorException('Check server logs')
	}
}
