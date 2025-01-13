import { Currency, DocumentType } from '../enums'

export interface StockTransaction {
	id: number
	documentType?: DocumentType
	invoiceNumber?: string
	controlNumber?: string
	date: Date
	total: number
	currency: Currency
	currencyExchangeFrom: Currency
	currencyExchangeTo: Currency
	exchangeRate: number
	metadata?: Record<string, any>
	comment?: string
	clientId?: string
	createdAt?: Date
	updatedAt?: Date
}

export interface StockTransactionItem {
	id: number
	productStockId?: number
	quantity: number
	amount: number
	createdAt?: Date
	updatedAt?: Date
}
