import * as firebase from 'firebase'
import 'firebase/firestore'
import IUser from '../constants/Interfaces/IUser'
import { getProfileDocument } from '../constants/firestorePath'
import { getUserSnapshot } from '../contexts/UserAuthContext/services'

const firebaseConfig = {
	apiKey: process.env.FIRESTORE_KEY,
	authDomain: 'portfolio-7fd42.firebaseapp.com',
	databaseURL: 'https://portfolio-7fd42.firebaseio.com',
	projectId: 'portfolio-7fd42',
	storageBucket: 'portfolio-7fd42.appspot.com',
	messagingSenderId: '1072905933783',
	appId: '1:1072905933783:web:1c4102bef3e606f9607192',
	measurementId: 'G-SRLQ49QHYV'
}

export const firebaseApp = () => {
	if (firebase.apps.length === 0) {
		return firebase.initializeApp(firebaseConfig)
	}

	return firebase.app()
}

export const appFirestore = () => {
	return firebase.app().firestore()
}

/**
 * Login customer
 * @param username String: username, must be an email
 * @param password String: password (no hash)
 */
export const loginUser = async (
	email: string,
	password: string,
	persistence: 'local' | 'session' | 'none'
): Promise<boolean> => {
	try {
		await firebaseApp().auth().setPersistence(persistence)
		const signContext = await firebaseApp().auth().signInWithEmailAndPassword(email, password)

		if (!!!signContext.user) {
			return false
		}

		return true
	} catch (_err) {
		return false
	}
}

export const loginWithSocial = async (type: string): Promise<string | boolean> => {
	firebase.auth().languageCode = 'fr'
	let provider = new firebase.auth.GoogleAuthProvider()

	if (type === 'facebook') {
		provider = new firebase.auth.FacebookAuthProvider()
	}

	let login
	try {
		if (type === 'google') {
			login = await firebase.auth().signInWithPopup(provider)
		} else {
			login = await firebase.auth().signInWithRedirect(provider)
		}
	} catch (err) {
		return err.code
	}

	if (!!!login.user) {
		return false
	}

	const profile = await getUserSnapshot(login.user.email as string)

	if (!profile.exists) {
		if (!!!login.additionalUserInfo) {
			return false
		}

		if (!!!login.additionalUserInfo.profile) {
			return false
		}

		if (type === 'google') {
			const googleProfile = login.additionalUserInfo.profile

			await appFirestore().doc(getProfileDocument(login.user.email as string)).set({
				name: googleProfile.given_name,
				family_name: googleProfile.family_name,
				email: googleProfile.email,
				picture: googleProfile.picture
			})
		} else {
			const facebookProfile = login.additionalUserInfo.profile

			await appFirestore().doc(getProfileDocument(login.user.email as string)).set({
				name: facebookProfile.first_name,
				family_name: facebookProfile.last_name,
				email: facebookProfile.email,
				picture: facebookProfile.picture.data.url
			})
		}
	} else return true
}

/**
 * Logs out the user
 */
export const logout = async (): Promise<boolean> => {
	try {
		await firebaseApp().auth().signOut()
		return true
	} catch (error) {
		return false
	}
}

/**
 * Register a new user.
 * @param user Object: User object. Must have email and password
 */
export const registerUser = async (user: IUser, password: string): Promise<boolean | string> => {
	try {
		console.log(user.email)
		const registerContext = await firebaseApp().auth().createUserWithEmailAndPassword(user.email, password)

		if (!!!registerContext.user) {
			return false
		}

		await appFirestore().doc(getProfileDocument(user.email)).set(user)

		const currentUser = firebaseApp().auth().currentUser
		if (!!!currentUser) return false
		// await currentUser.sendEmailVerification()

		return true
	} catch (error) {
		return error.message
	}
}

export const userAuthStateListener = (action: (user: any) => void) => {
	firebaseApp().auth().onAuthStateChanged(action)
}
