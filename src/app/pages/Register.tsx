import { ChangeEvent, useState, useEffect, Fragment } from 'react'

//Next
import { useRouter } from 'next/router'
import Link from 'next/link'

//Interfaces
import IUser from '../constants/Interfaces/IUser'

//Layout
import Main from '../layouts/Main'
import { Input, Button } from '../components'
import {
	registerUser,
	loginWithSocial,
	firebaseApp,
	appFirestore,
	verifyUsername,
	verifyEmail
} from '../services/firebase'
import GoogleIcon from '../constants/Icones/GoogleIcon'
import FacebookIcon from '../constants/Icones/FacebookIcon'

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

interface IProps {
	readonly query: any
}

const register = ({ query }) => {
	const router = useRouter()
	const [ user, setUser ] = useState<IUser>({ username: '', name: '', family_name: '', email: '', picture: 'custom' })
	const [ usernameValid, setUsernameValid ] = useState<boolean>(true)
	const [ emailValid, setEmailValid ] = useState<boolean>(true)
	const [ password, setPassword ] = useState<string>('')
	const [ updateUsername, setUpdateUsername ] = useState<boolean>(false)

	const [ errors, setErrors ] = useState({
		email: {
			value: false,
			error_message: ''
		}
	})

	useEffect(
		() => {
			if (!!!query) return

			if (query.action && query.action === 'updateUsername') {
				setUpdateUsername(true)
			}
		},
		[ query ]
	)

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

	const handleBlurUsername = async (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement
		setUsernameValid(await verifyUsername(input.value))
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

	const handleBlurEmail = async (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement
		if (validateEmail()) {
			setEmailValid(await verifyEmail(input.value))
		}
	}

	const handleSubmit = async () => {
		if (updateUsername) {
			const userData = await appFirestore().collection('users').doc(firebaseApp().auth().currentUser.email).get()
			userData.ref.update({ username: user.username })
			router.push('/')
		} else {
			const register = registerUser(user, password)
			if (register) {
				router.push('/')
			}
		}
	}

	const registerWithSocial = async (social: string) => {
		const register = await loginWithSocial(social)
		if (register === true) {
			router.push('/')
		}
	}

	return (
		<Main>
			<div className='register container'>
				<h1>S'enregistrer</h1>

				<form className='register__container container shadow border-radius mt-25'>
					{!updateUsername ? (
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
					) : null}

					<Input
						label='Nom d&#39;utilisateur'
						name='username'
						value={user.username}
						error={!usernameValid && <span className='error'>Ce nom d'utilisateur est déjà utilisé.</span>}
						onChange={handleChange}
						onBlur={handleBlurUsername}
					/>

					{!updateUsername ? (
						<Fragment>
							<Input label='Nom' name='name' value={user.name} onChange={handleChange} />

							<Input
								label='Nom de famille'
								name='family_name'
								value={user.family_name}
								onChange={handleChange}
							/>

							<Input
								label='Courriel'
								name='email'
								value={user.email}
								error={
									errors.email.value ? (
										<span className='error'>{errors.email.error_message}</span>
									) : (
										!emailValid && (
											<span className='error'>Cette adresse courriel est déjà utilisée.</span>
										)
									)
								}
								onChange={handleChange}
								onBlur={handleBlurEmail}
							/>

							<Input
								label='Mot de passe'
								name='password'
								value={password}
								type='password'
								onChange={handleChange}
							/>
						</Fragment>
					) : null}

					<div className='register__container__btns p-25'>
						<Button action={handleSubmit}>S'enregistrer</Button>
						<Link href='/login'>
							<a>Se connecter</a>
						</Link>
					</div>
				</form>
			</div>
		</Main>
	)
}

register.getInitialProps = async ({ query }) => {
	return { query }
}

export default register
