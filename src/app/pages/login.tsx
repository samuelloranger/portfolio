import React, { useContext, useState, useEffect } from 'react'

//Next
import Router from 'next/router'

//Layout
import Main from '../layouts/Main'
import LoginPageComponent from '../components/LoginPageComponent'
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'
import { userAuthStateListener } from '../services/firebase'

interface IProps {
	readonly query: any
}

const Login = ({ query }: IProps) => {
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

	if (userConnected) {
		Router.push('/')
	}

	return (
		<Main>
			<LoginPageComponent query={query} />
		</Main>
	)
}

Login.getInitialProps = async ({ query }) => {
	return { query }
}

export default Login
