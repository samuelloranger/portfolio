import { firestore } from 'firebase'
import IUser from '../../constants/Interfaces/IUser'

export default interface IUserAuthContextState {
	readonly email: string | undefined
	readonly userSnapshot?: firestore.DocumentSnapshot<IUser>
	readonly fetching: boolean
	readonly userData?: IUser
}
