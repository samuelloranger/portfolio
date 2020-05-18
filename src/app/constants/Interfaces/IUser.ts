export default interface IUser {
	readonly username: string
	readonly name: string
	readonly family_name: string
	readonly email: string
	readonly picture: 'custom' | 'facebook' | 'google' | 'none'
	readonly c_picture?: string
	readonly f_picture?: string
	readonly g_picture?: string
	readonly description?: string
	readonly location?: string
	readonly poste?: string
	readonly employeur?: string
}

export const getDefaultUser = (): IUser => {
	return {
		username: '',
		name: '',
		family_name: '',
		email: '',
		picture: 'none',
		c_picture: '',
		f_picture: '',
		g_picture: '',
		description: '',
		poste: '',
		employeur: ''
	}
}
