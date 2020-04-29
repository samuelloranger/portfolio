import { firestore } from 'firebase'
import { appFirestore } from '../../../services/firebase'
import { getProfileDocument } from '../../../constants/firestorePath'
import IUser from '../../../constants/Interfaces/IUser'

/**
 * Fetch the user snapshot
 * @param email String | email of the authentificated user
 */
export const getUserSnapshot = async (email: string): Promise<firestore.DocumentSnapshot<IUser> | undefined> => {
	try {
		const userSnapshot = await appFirestore().doc(getProfileDocument(email)).get()
		return userSnapshot as firestore.DocumentSnapshot<IUser>
	} catch (err) {
		return undefined
	}
}
