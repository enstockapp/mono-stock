import { MeasureUnitType } from 'src/common'
import {
	CreateProductUniqueDto,
	CreateProductWithVariantsDto,
} from 'src/products/dto'

const ProductsUniqueDB: CreateProductUniqueDto[] = [
	{
		product: {
			reference: 'U00001',
			name: 'Pantalon bota ancha',
			description: 'Ejemplo description pantalon',
			unitType: MeasureUnitType.Unit,
			baseCost: 4,
			price: 7.5,
			// categoryId: 23,
		},
		stock: {
			initialQuantity: 8,
		},
	},
	{
		product: {
			reference: 'U00002',
			name: 'Falda',
			description: 'Ejemplo description falda',
			unitType: MeasureUnitType.Unit,
			baseCost: 5,
			price: 10,
			// categoryId: 23,
		},
		stock: {
			initialQuantity: 12,
		},
	},
]

const ProductsWithVarintsDB: CreateProductWithVariantsDto[] = [
	{
		product: {
			reference: 'V00003',
			name: 'Franelas',
			description: 'Ejemplo description',
			unitType: MeasureUnitType.Unit,
			baseCost: 3,
			price: 8,
			// categoryId: 23,
		},
		itemsVariants: [
			{
				// optionCombination: [59, 63],
				optionCombination: [], // Agregada en seed
				stock: {
					initialQuantity: 11,
				},
			},
			{
				optionCombination: [],
				stock: {
					initialQuantity: 12,
				},
			},
			{
				optionCombination: [],
				stock: {
					initialQuantity: 13,
				},
			},
		],
	},
	{
		product: {
			reference: 'V00004',
			name: 'Sueters',
			description: 'Ejemplo description',
			unitType: MeasureUnitType.Unit,
			baseCost: 10,
			price: 15,
			// categoryId: 23,
		},
		itemsVariants: [
			{
				// optionCombination: [59, 63],
				optionCombination: [], // Agregada en seed
				stock: {
					initialQuantity: 11,
				},
			},
			{
				optionCombination: [],
				stock: {
					initialQuantity: 12,
				},
			},
			{
				optionCombination: [],
				stock: {
					initialQuantity: 13,
				},
			},
		],
	},
]

export const ProductsDB = {
	ProductsUniqueDB,
	ProductsWithVarintsDB,
}
