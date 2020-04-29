import { useState, useEffect } from 'react'

//Interface
import IUser from '../../constants/Interfaces/IUser'

//Firebase
import UserAuthContext from './UserAuthContext'
import { getUserSnapshot } from './services'
import { firebaseApp, userAuthStateListener, appFirestore } from '../../services/firebase'
import { getProfileDocument } from '../../constants/firestorePath'

export default ({ children }: any) => {
	const [ state, setState ] = useState({
		email: undefined,
		fetching: true
	})

	useEffect(() => {
		const fetchUser = async (email: string) => {
			if (!!!firebaseApp().auth().currentUser) {
				setState((prevState) => ({
					...prevState,
					email: undefined,
					userSnapshot: undefined,
					fetching: false
				}))
				return
			}

			const userSnapshot = await getUserSnapshot(email)

			if (!userSnapshot || !userSnapshot.exists) {
				setState((prevState) => ({
					...prevState,
					email: undefined,
					userSnapshot: undefined,
					fetching: false
				}))
				return
			}

			setState((prevState) => ({
				...prevState,
				email,
				userSnapshot,
				fetching: false
			}))
		}

		let unregisteredSnap: any

		userAuthStateListener((user: any) => {
			if (!!!user) {
				return
			}
			fetchUser(user.email)
			unregisteredSnap = appFirestore().doc(getProfileDocument(user.email)).onSnapshot((snap) => {
				if (!snap.exists) {
					return
				}

				setState((prevState) => ({ ...prevState, userData: snap.data() as IUser }))
			})
		})

		return () => {
			if (unregisteredSnap) {
				unregisteredSnap()
			}
		}
	}, [])

	return <UserAuthContext.Provider value={state}>{children}</UserAuthContext.Provider>
}
