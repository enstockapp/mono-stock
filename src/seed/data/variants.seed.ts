import { CreateVariantDto } from 'src/variants'

export const VariantsDB: { [key: string]: CreateVariantDto } = {
	sizes: {
		name: 'Sizes',
		description: 'Size of clothe',
		options: ['XS', 'S', 'M', 'L', 'XL'],
	},
	colors: {
		name: 'Colors',
		description: 'Colors of things',
		options: ['Red', 'Green', 'Blue'],
	},
}
