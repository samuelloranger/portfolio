import React, { ChangeEvent, useState } from 'react'

//Next
import Router from 'next/router'

//Interfaces
import IUser from '../constants/Interfaces/IUser'

//Layout
import Main from '../layouts/Main'
import { Input, Button } from '../components'
import { registerUser } from '../services/firebase'

const Register = () => {
	const [ user, setUser ] = useState<IUser>({ name: '', family_name: '', email: '' })
	const [ password, setPassword ] = useState<string>('')

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement

		if (input.name === 'password') {
			setPassword(input.value)
		} else {
			setUser((prevState: any) => ({
				...prevState,
				[input.name]: input.value
			}))
		}
	}

	const handleSubmit = async () => {
		const register = registerUser(user, password)
		if (register) {
			Router.push('/')
		}
	}

	return (
		<Main>
			<div className='register container'>
				<h1>S'enregistrer</h1>

				<div className='register__container container shadow border-radius '>
					<Input label='Nom' name='name' onChange={handleChange} />

					<Input label='Nom de famille' name='family_name' onChange={handleChange} />

					<Input label='Courriel' name='email' onChange={handleChange} />

					<Input label='Password' name='password' type='password' onChange={handleChange} />

					<div className='p-25'>
						<Button label='S&#39;enregistrer' action={handleSubmit} />
					</div>
				</div>
			</div>
		</Main>
	)
}

export default Register
