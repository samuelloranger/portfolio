import React, { ChangeEvent, useState, useEffect } from 'react'

//Next
import Router from 'next/router'

//Component
import { Input, Button } from '../components'
import { loginUser } from '../services/firebase'

const LoginPageComponent = () => {
	const [ user, setUser ] = useState({ email: '', password: '' })
	const [ rememberMe, setRememberMe ] = useState<boolean>(false)

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement

		setUser((prevState: any) => ({
			...prevState,
			[input.name]: input.value
		}))
	}

	useEffect(
		() => {
			console.log(rememberMe)
		},
		[ rememberMe ]
	)

	const handleRememberMe = () => {
		setRememberMe(!rememberMe)
	}

	const handleSubmit = async () => {
		let persistance: any = rememberMe ? 'local' : 'none'
		await loginUser(user.email, user.password, persistance)
	}

	return (
		<div className='register container'>
			<h1>Se connecter</h1>

			<div className='register__container container shadow border-radius '>
				<Input label='Courriel' name='email' onChange={handleChange} />

				<Input label='Password' name='password' type='password' onChange={handleChange} />

				<Input
					label='Se souvenir de moi'
					name='remember_me'
					type='checkbox'
					className='pl-25 pt-25'
					defaultChecked={true}
					onChange={handleRememberMe}
				/>

				<div className='p-25'>
					<Button label='Se connecter' action={handleSubmit} />
				</div>
			</div>
		</div>
	)
}

export default LoginPageComponent
