/**
 * Compare two arrays and return true if they have at least one common element
 * @param arr1
 * @param arr2
 * @returns
 */
export function hasCommonElement(arr1: any[], arr2: any[]): boolean {
	return arr1.some(element => arr2.includes(element))
}

/**
 * Return true if all strings in the array are different
 * @param arr
 * @returns
 */
export function areAllStringsDifferent(
	arr: string[],
	ignoreCase = true,
): boolean {
	const seenStrings = new Set<string>()

	// if ignoreCase is false, convert all strings to lowercase
	const array = ignoreCase ? arr : arr.map(str => str.toLowerCase())

	for (const str of array) {
		if (seenStrings.has(str)) return false // Duplicate found
		seenStrings.add(str)
	}
	return true // No duplicates found
}

export function getUniqueArraysNumbersArray(arr: number[][]): number[][] {
	const optionsCombSorted = arr.map(comb =>
		comb.toSorted((a, b) => a - b).toString(),
	)
	const sett = Array.from(new Set(optionsCombSorted))
	const uniqueOptionsComb = sett.map(comb => comb.split(',').map(str => +str))

	return uniqueOptionsComb
}
