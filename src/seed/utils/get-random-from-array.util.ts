export function getRandomFromArray<T>(arr: T[]): T {
	const randomIndex = getRandomInt(arr.length)
	return arr[randomIndex]
}

const getRandomInt = (max: number) => {
	return Math.floor(Math.random() * max)
}
