import { VariantOptionSummary } from './variant-option-summary.interface'

export interface VariantSummary {
	id: number
	name: string
	description?: string
	canEdit: boolean
	variantOptions?: VariantOptionSummary[]
	clientId?: string
}
