import React, { useContext, useState, useEffect } from 'react'
import Main from '../layouts/Main'
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'
import { userAuthStateListener } from '../services/firebase'
import LoginPageComponent from '../components/LoginPageComponent'

const dashboard = () => {
	const { userSnapshot } = useContext(UserAuthContext)
	const [ userConnected, setUserConnected ] = useState<boolean>(false)

	useEffect(
		() => {
			userAuthStateListener(userListener)
		},
		[ userSnapshot ]
	)

	const userListener = async (user: any) => {
		if (user) {
			setUserConnected(true)
		}
	}

	if (!userConnected) {
		return (
			<Main>
				<LoginPageComponent />
			</Main>
		)
	}

	return (
		<Main>
			<div className='container'>
				<h1>Dashboard</h1>
			</div>
		</Main>
	)
}

export default dashboard
