export default interface ISkill {
	id: number
	name: string
	description: string
	iconUrl: string
	dateCreated: Date
	checked: boolean
}

export const getDefaultSkill = (): ISkill => {
	return {
		id: Date.now(),
		name: '',
		description: '',
		iconUrl: '/icons/uploadImage.svg',
		dateCreated: new Date(),
		checked: false
	}
}
