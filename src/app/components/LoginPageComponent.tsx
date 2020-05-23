import React, { ChangeEvent, useState, useEffect, Fragment } from 'react'

//Next
import Link from 'next/link'

//Component
import { Input, Button, Loader } from '../components'
import { loginUser, loginWithSocial, firebaseApp } from '../services/firebase'

//Icones
import GoogleIcon from '../constants/Icones/GoogleIcon'
import FacebookIcon from '../constants/Icones/FacebookIcon'

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

interface IProps {
	readonly query?: any
}

const LoginPageComponent = ({ query }: IProps) => {
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
	const [ rememberMe, setRememberMe ] = useState<boolean>(true)
	const [ passwordChangeRequest, setPasswordChangeRequest ] = useState<boolean>(false)
	const [ passwordChanged, setPasswordChanged ] = useState<boolean>(false)

	useEffect(
		() => {
			if (!!!query) return

			if (query.action && query.action === 'passwordChanged') {
				setPasswordChanged(true)
			}
		},
		[ query ]
	)

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
			let persistance: 'local' | 'session' | 'none' = rememberMe ? 'local' : 'session'
			const login = await loginUser(user.email, user.password, persistance)

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

	const sendForgotPasswordEmail = () => {
		if (validateEmail() && !passwordChangeRequest) {
			firebaseApp().auth().sendPasswordResetEmail(user.email)
			setPasswordChangeRequest(true)
		}
	}

	return (
		<div className='register container'>
			<h1>Se connecter</h1>

			<form className='register__container container shadow border-radius '>
				{passwordChanged && <p className='pt-25 pl-15 mb-0 bold'>Votre mot de passe a été changé.</p>}

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

				<Input
					label='Password'
					name='password'
					type='password'
					value={user.password}
					onChange={handleChange}
					error={
						errors.account.value && (
							<span className='error error--account'>{errors.account.error_message}</span>
						)
					}
				/>

				<Input
					label='Se souvenir de moi'
					name='remember_me'
					type='checkbox'
					value={''}
					className='pl-25 pt-25'
					defaultChecked={true}
					onChange={() => setRememberMe(!rememberMe)}
				/>

				<p className='a pl-25' onClick={sendForgotPasswordEmail}>
					Mot de passe oublié?
				</p>

				{passwordChangeRequest && (
					<p className='pl-25'>
						Nous vous avons envoyé un courriel pour que vous puissiez changer de mot de passe.
					</p>
				)}

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
