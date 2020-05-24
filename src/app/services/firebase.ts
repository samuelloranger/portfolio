import * as firebase from 'firebase'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/firebase-storage'
import IUser from '../constants/Interfaces/IUser'
import { getProfileDocument } from '../constants/firestorePath'
import { getUserSnapshot } from '../contexts/UserAuthContext/services'
import Router from 'next/router'

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
	return firebaseApp().firestore()
}

export const appStorage = () => {
	return firebase.storage()
}

export const appAuth = () => {
	return firebase.auth()
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
	appAuth().languageCode = 'fr'
	let provider = new firebase.auth.GoogleAuthProvider()

	if (type === 'facebook') {
		provider = new firebase.auth.FacebookAuthProvider()
	}

	let login
	try {
		if (type === 'google') {
			login = await appAuth().signInWithPopup(provider)
		} else {
			login = await appAuth().signInWithPopup(provider)
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
				picture: 'google',
				g_picture: googleProfile.picture,
				dateCreated: new Date().toString(),
				accountType: 'google'
			})

			Router.push('/register?action=updateUsername')
		} else {
			const facebookProfile = login.additionalUserInfo.profile

			await appFirestore().doc(getProfileDocument(login.user.email as string)).set({
				name: facebookProfile.first_name,
				family_name: facebookProfile.last_name,
				email: facebookProfile.email,
				picture: 'facebook',
				f_picture: facebookProfile.picture.data.url,
				dateCreated: new Date().toString(),
				accountType: 'facebook'
			})

			Router.push('/register?action=updateUsername')
		}
	} else return true
}

export const getProfilePicture = async (email = '') => {
	const userData = (await getUserSnapshot(email)).data()
	if (!!!userData) return ''
	const basicImg = '/img/userProfileImg.svg'

	switch (userData.picture) {
		case 'google':
			return userData.g_picture ? userData.g_picture : basicImg
		case 'facebook':
			return userData.f_picture ? userData.f_picture : basicImg
		case 'custom':
			// const customPicture = await appStorage().ref(userData.c_picture).getDownloadURL()
			// return customPicture
			return userData.c_picture ? userData.c_picture : basicImg
		case 'none':
			return basicImg
	}
}

export const verifyUsername = async (username: string) => {
	const users = await appFirestore().collection('users').where('username', '==', username).get()
	return !users.docs.length
}

export const verifyEmail = async (email: string) => {
	const users = await appFirestore().collection('users').doc(email).get()
	return !users.exists
}

export const changeEmail = async (user: IUser, oldEmail: string) => {
	const usersColl = appFirestore().collection('users')
	const collProjets = await usersColl.doc(oldEmail).collection('projects').get()
	const collSkills = await usersColl.doc(oldEmail).collection('skills').get()
	const collTags = await usersColl.doc(oldEmail).collection('tags').get()

	try {
		await usersColl.doc(user.email).set({ ...user })

		collProjets.docs.map(async (project) => {
			await usersColl.doc(oldEmail).collection('projects').doc(project.id).delete()
			return await usersColl.doc(user.email).collection('projects').doc(project.id).set({ ...project.data() })
		})

		collTags.docs.map(async (tag) => {
			await usersColl.doc(oldEmail).collection('tags').doc(tag.id).delete()
			return await usersColl.doc(user.email).collection('tags').doc(tag.id).set({ ...tag.data() })
		})

		collSkills.docs.map(async (skill) => {
			await usersColl.doc(oldEmail).collection('skills').doc(skill.id).delete()
			return await usersColl.doc(user.email).collection('skills').doc(skill.id).set({ ...skill.data() })
		})

		await firebaseApp().auth().currentUser.updateEmail(user.email)

		await usersColl.doc(oldEmail).delete()
	} catch (err) {
		return false
	}

	return true
}

/**
 * Logs out the user
 */
export const logout = async (): Promise<boolean> => {
	try {
		await firebaseApp().auth().signOut()
		Router.push('/')
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
