export default interface IUser {
	readonly name: string
	readonly family_name: string
	readonly email: string
	readonly picture: 'custom' | 'facebook' | 'google' | 'none'
	readonly c_picture?: string
	readonly f_picture?: string
	readonly g_picture?: string
	readonly description?: string
	readonly poste?: string
	readonly employeur?: string
}

export const getDefaultUser = (): IUser => {
	return {
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
