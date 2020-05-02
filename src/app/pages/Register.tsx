import React, { ChangeEvent, useState, Fragment } from 'react'

//Next
import Router from 'next/router'
import Link from 'next/link'

//Interfaces
import IUser from '../constants/Interfaces/IUser'

//Layout
import Main from '../layouts/Main'
import { Input, Button } from '../components'
import { registerUser, loginWithSocial } from '../services/firebase'
import GoogleIcon from '../constants/Icones/GoogleIcon'
import FacebookIcon from '../constants/Icones/FacebookIcon'

const Register = () => {
	const [ user, setUser ] = useState<IUser>({ name: '', family_name: '', email: '', picture: 'custom' })
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

	const registerWithSocial = async (social: string) => {
		const register = await loginWithSocial(social)
		if (register === true) {
			Router.push('/')
		}
	}

	return (
		<Main>
			<div className='register container'>
				<h1>S'enregistrer</h1>

				<form className='register__container container shadow border-radius '>
					<div className='register__container__btnSocial'>
						<Button className='btn--google' action={() => registerWithSocial('google')}>
							<Fragment>
								<GoogleIcon />
								S'enregistrer
							</Fragment>
						</Button>
						<Button className='btn--facebook' action={() => registerWithSocial('facebook')}>
							<Fragment>
								<FacebookIcon />
								S'enregistrer
							</Fragment>
						</Button>
					</div>

					<Input label='Nom' name='name' value={user.name} onChange={handleChange} />

					<Input label='Nom de famille' name='family_name' value={user.family_name} onChange={handleChange} />

					<Input label='Courriel' name='email' value={user.email} onChange={handleChange} />

					<Input label='Password' name='password' value={password} type='password' onChange={handleChange} />

					<div className='register__container__btns p-25'>
						<Button action={handleSubmit}>S'enregistrer</Button>
						<Link href='/login'>
							<a>S'enregistrer</a>
						</Link>
					</div>
				</form>
			</div>
		</Main>
	)
}

export default Register
