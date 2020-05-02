import React, { ChangeEvent, useState, useEffect, Fragment } from 'react'

//Next
import Link from 'next/link'

//Component
import { Input, Button, Loader } from '../components'
import { loginUser, loginWithSocial } from '../services/firebase'

//Icones
import GoogleIcon from '../constants/Icones/GoogleIcon'
import FacebookIcon from '../constants/Icones/FacebookIcon'

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const LoginPageComponent = () => {
	const [ loading, setLoading ] = useState<boolean>(false)
	const [ user, setUser ] = useState({ email: '', password: '' })
	const [ errors, setErrors ] = useState({
		email: {
			value: false,
			error_message: ''
		},
		account: {
			value: false,
			error_message: ''
		}
	})
	const [ rememberMe, setRememberMe ] = useState<boolean>(false)

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement

		setUser((prevState: any) => ({
			...prevState,
			[input.name]: input.value
		}))
	}

	const validateEmail = () => {
		if (user.email === '') {
			setErrors((prevState: any) => ({
				...prevState,
				email: {
					...prevState.email,
					value: true,
					error_message: 'Vous devez entrer un courriel.'
				}
			}))
			setLoading(false)

			return false
		}

		const testRegex = new RegExp(EMAIL_REGEX).test(user.email)
		if (!testRegex) {
			setErrors((prevState: any) => ({
				...prevState,
				email: {
					...prevState.email,
					value: true,
					error_message: 'Vous devez entrer un courriel valide.'
				}
			}))
			setLoading(false)

			return false
		}

		setErrors((prevState: any) => ({
			...prevState,
			email: {
				...prevState.email,
				value: false,
				error_message: ''
			}
		}))

		return true
	}

	const handleSubmit = async () => {
		setLoading(true)
		if (validateEmail()) {
			let persistance: any = rememberMe ? 'local' : 'none'
			const login = await loginUser(user.email, user.password, persistance)

			console.log(login)
			if (login === true) {
				setLoading(false)
				return
			}

			if (!!!(login as any).code) {
				setErrors((prevState: any) => ({
					...prevState,
					account: {
						...prevState.email,
						value: true,
						error_message: 'Vous devez fournir un mot de passe.'
					}
				}))
			}

			if (!login) {
				setErrors((prevState: any) => ({
					...prevState,
					account: {
						...prevState.email,
						value: true,
						error_message:
							'Courriel ou mot de passe incorrect. Essayez de vous connecter avec votre compte Google.'
					}
				}))
			}
			setLoading(false)
			return
		}
	}

	const loginSocial = async (social: string) => {
		await loginWithSocial(social)
	}

	return (
		<div className='register container'>
			<h1>Se connecter</h1>

			<form className='register__container container shadow border-radius '>
				<div className='register__container__btnSocial'>
					<Button className='btn--google' action={() => loginSocial('google')}>
						<Fragment>
							<GoogleIcon />
							Se connecter
						</Fragment>
					</Button>
					<Button className='btn--facebook' action={() => loginSocial('facebook')}>
						<Fragment>
							<FacebookIcon />
							Se connecter
						</Fragment>
					</Button>
				</div>

				<Input
					label='Courriel'
					name='email'
					value={user.email}
					error={errors.email.value ? <span className='error'>{errors.email.error_message}</span> : null}
					onChange={handleChange}
				/>

				<Input label='Password' name='password' type='password' value={user.password} onChange={handleChange} />

				{errors.account.value ? (
					<span className='error error--account'>{errors.account.error_message}</span>
				) : null}

				<Input
					label='Se souvenir de moi'
					name='remember_me'
					type='checkbox'
					value={''}
					className='pl-25 pt-25'
					defaultChecked={true}
					onChange={() => setRememberMe(!rememberMe)}
				/>

				<div className='register__container__btns p-25'>
					<Button action={handleSubmit}>{loading ? <Loader /> : 'Se connecter'}</Button>
					<Link href='/register'>
						<a>S'enregistrer</a>
					</Link>
				</div>
			</form>
		</div>
	)
}

export default LoginPageComponent
