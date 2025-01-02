import { RoleEnum } from 'src/roles'
import { CreateClientDto, IdentificationType } from 'src/client'
import { Currency } from 'src/common'
import { CreateUserDto } from 'src/users'

const EnStockName = 'EnStock'
const EnStockId = '241b0fb2-c6e0-4c56-b879-350ead2a181d'
const EnStockEmail = 'enstockapp@gmail.com'

export const InitClientsDB: CreateClientDto[] = [
	{
		id: EnStockId,
		name: EnStockName,
		identificationType: IdentificationType.V,
		identification: '20663174',
		email: EnStockEmail,
		phoneNumber: '+584244076377',
		mainCurrency: Currency.USD,
	},
]

export const InitUsersDB: CreateUserDto[] = [
	{
		id: '6197d4cc-630c-4bf6-b8b6-8db5fafd51fb',
		name: EnStockName,
		email: EnStockEmail,
		password: 'Fre24ddy68',
		clientId: EnStockId,
		roles: [RoleEnum.superAdmin],
	},
]
