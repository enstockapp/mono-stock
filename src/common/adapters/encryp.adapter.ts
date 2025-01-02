import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class EncryptAdapter {
	/**
	 * Convert password without encrypt in encrypted password
	 * @param password
	 * @returns encrypted password
	 */
	hashSync(password: string): string {
		const saltOrRounds: string | number = 10
		return bcrypt.hashSync(password, saltOrRounds)
	}

	/**
	 * Validate if strings is equal to the value encrypted
	 * @param password password without encrypt
	 * @param realPassword encrypted password
	 * @returns
	 */
	compareSync(password: string, realPassword: string): boolean {
		return bcrypt.compareSync(password, realPassword)
	}
}
