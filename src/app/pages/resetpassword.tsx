import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import Main from '../layouts/Main'
import { Input, Button } from '../components'
import { firebaseApp, userAuthStateListener } from '../services/firebase'
import Loader from 'react-spinners/ClipLoader'

interface IProps {
	readonly query: any
}

const resetpassword = ({ query }: IProps) => {
	const router = useRouter()
	const [ loading, setLoading ] = useState<boolean>(false)
	const [ password, setPassword ] = useState({ value: '', changed: false })
	const [ resetPw, setResetPw ] = useState<string>('')
	const [ error, setError ] = useState({ identicalPw: false, passwordEmpty: false, passwordTooShort: false })

	useEffect(
		() => {
			setError((prevState) => ({
				...prevState,
				identicalPw: resetPw !== password.value
			}))
		},
		[ resetPw ]
	)

	useEffect(
		() => {
			if (!password.changed) return

			setError((prevState) => ({
				...prevState,
				passwordEmpty: password.value === '',
				passwordTooShort: false
			}))
		},
		[ password ]
	)

	const handleSubmit = async () => {
		setLoading(true)

		try {
			await firebaseApp().auth().confirmPasswordReset(query.oobCode, password.value)
		} catch (err) {
			return setError((prevState) => ({
				...prevState,
				passwordTooShort: err.code === 'auth/weak-password'
			}))
		}

		setLoading(false)
		return router.push('/login?action=passwordChanged')
	}

	return (
		<Main>
			<form className='passwordReset shadow container p-25 '>
				<h2>Réinitialiser votre mot de passe</h2>

				<Input
					label='Nouveau mot de passe'
					name='password'
					className='pl-0 pt-25'
					value={password.value}
					type='password'
					onChange={(e) => setPassword({ value: e.currentTarget.value, changed: true })}
				/>

				{error.passwordEmpty && <p className='error'>Le mot de passe ne peut pas être vide.</p>}
				{error.passwordTooShort && <p className='error'>Le mot de passe doit être d'au moins 6 caractères.</p>}

				<Input
					label='Répéter le mot de passe'
					name='password'
					className='pl-0 pt-25'
					value={resetPw}
					type='password'
					onChange={(e) => setResetPw(e.currentTarget.value)}
				/>

				{error.identicalPw && <p className='error'>Les mots de passe doivent être identiques.</p>}

				<Button className='mt-25' action={handleSubmit}>
					<Fragment>
						Changer le mot de passe
						{loading && (
							<span className='ml-5'>
								<Loader color='#fff' size={16} />
							</span>
						)}
					</Fragment>
				</Button>
			</form>
		</Main>
	)
}

resetpassword.getInitialProps = async ({ query }) => {
	return { query }
}

export default resetpassword
