export default interface ISkill {
	name: string
	description: string
	iconUrl: string
	dateCreated: Date
	checked: boolean
}

export const getDefaultSkill = (): ISkill => {
	return {
		name: '',
		description: '',
		iconUrl: '/icons/uploadImage.svg',
		dateCreated: new Date(),
		checked: false
	}
}
