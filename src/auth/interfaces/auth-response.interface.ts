import { PublicUser } from 'src/users'

export interface AuthResponse {
	user: PublicUser
	token: string
}
