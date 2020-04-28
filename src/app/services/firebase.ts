import * as firebase from 'firebase'
import 'firebase/firestore'

const firebaseConfig = {
	apiKey: 'AIzaSyAd8ZceCxCWtGT8frxXc9BVpeCKpUIpu6w',
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
