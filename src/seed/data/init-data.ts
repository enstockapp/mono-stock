import { RoleEnum } from 'src/roles'
import { CreateClientDto } from 'src/client'
import { Currency, IdentificationType } from 'src/common'
import { CreateUserDto } from 'src/users'

const EnStock = {
	name: 'EnStock',
	id: '241b0fb2-c6e0-4c56-b879-350ead2a181d',
	email: 'enstockapp@gmail.com',
	userId: '6197d4cc-630c-4bf6-b8b6-8db5fafd51fb',
}

const Freddy = {
	name: 'Freddy',
	id: '230c9a52-5203-4b9b-bf03-6d8aaf420549',
	email: 'freddy@mail.com',
	userId: '2358a815-5d40-448c-86a9-7449706a36ab',
}

export const InitClientsDB: CreateClientDto[] = [
	{
		id: EnStock.id,
		name: EnStock.name,
		identificationType: IdentificationType.J,
		identification: '206631747',
		email: EnStock.email,
		phoneNumber: '+584244076377',
		mainCurrency: Currency.USD,
	},
	{
		id: Freddy.id,
		name: Freddy.name,
		identificationType: IdentificationType.V,
		identification: '20663174',
		email: Freddy.email,
		phoneNumber: '+584244076377',
		mainCurrency: Currency.USD,
	},
]

export const InitUsersDB: CreateUserDto[] = [
	{
		id: EnStock.userId,
		name: EnStock.name,
		email: EnStock.email,
		password: 'Fre24ddy68',
		clientId: EnStock.id,
		roles: [RoleEnum.superAdmin],
	},
	{
		id: Freddy.userId,
		name: Freddy.name,
		email: Freddy.email,
		password: 'Fre24ddy68',
		clientId: Freddy.id,
		roles: [RoleEnum.admin],
	},
]
