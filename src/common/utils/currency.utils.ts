import { Currency } from '../enums'

/**
 * Get amount in mainCurrency
 * @param mainCurrency
 * @param transactionCurrency
 * @param currencyExchangeFrom
 * @param exchangeRateRaw
 * @param amountRaw
 * @returns
 */
export const getAmountInMainCurrency = (
	mainCurrency: Currency,
	transactionCurrency: Currency,
	currencyExchangeFrom: Currency,
	exchangeRateRaw: number | string,
	amountRaw: number | string,
): number => {
	const amount = +amountRaw
	const exchangeRate = +exchangeRateRaw
	let newAmount = amount
	if (transactionCurrency !== mainCurrency) {
		newAmount =
			currencyExchangeFrom === mainCurrency
				? amount * exchangeRate
				: amount / exchangeRate
	}
	return newAmount
}
