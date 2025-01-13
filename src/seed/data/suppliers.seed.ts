import { IdentificationType } from 'src/common'
import { CreateSupplierDto } from 'src/suppliers'

export const SupplierDB: CreateSupplierDto[] = [
	{
		name: 'Proinmicastro',
		identificationType: IdentificationType.J,
		identification: '31090990-3',
	},
	{
		name: 'Coquelot',
		identificationType: IdentificationType.J,
		identification: '31757175-4',
	},
]
