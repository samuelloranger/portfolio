import IUser from './IUser'

export default interface IProject {
	id: number
	name: string
	author?: IUser
	description: string
	dateCreated: Date
	images: string[]
	checked: boolean
}

export const getDefaultProject = (): IProject => {
	return {
		id: Date.now(),
		name: '',
		description: '',
		dateCreated: new Date(),
		images: [],
		checked: false
	}
}
