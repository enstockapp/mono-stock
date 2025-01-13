import { IdentificationType } from 'src/common'
import { CreateCustomerDto } from 'src/customers'

export const CustomersDB: CreateCustomerDto[] = [
	{
		name: 'Mariela',
		lastname: 'Michelena',
		identificationType: IdentificationType.V,
		identification: '11525991',
	},
	{
		name: 'Freddy',
		lastname: 'Michelena',
		identificationType: IdentificationType.V,
		identification: '2781459',
	},
]
