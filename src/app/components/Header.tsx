import React, { useEffect, useState, useContext, Fragment } from 'react'
import Link from 'next/link'

//Components
import { Button, Loader } from './'

//Context
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'

//Firebase
import { logout, userAuthStateListener, getProfilePicture } from '../services/firebase'
import useWindowSize from '../constants/Hooks/useWindow'

const Header = () => {
	const { width } = useWindowSize()
	const { userData, userSnapshot } = useContext(UserAuthContext)

	const [ state, setState ] = useState({
		loading: true,
		menuActive: false,
		userConnected: false,
		username: '',
		userPicture: ''
	})

	useEffect(
		() => {
			setState((prevState) => ({
				...prevState,
				loading: true
			}))
			userAuthStateListener(userListener)
		},
		[ userSnapshot, userData ]
	)

	const userListener = async (user: any) => {
		if (user && userData) {
			setState((prevState) => ({
				...prevState,
				userConnected: true
			}))

			const profilePicture = await getProfilePicture()

			setState((prevState) => ({
				...prevState,
				loading: false,
				userPicture: profilePicture,
				username: userData.username
			}))
		}
	}

	const setUserData = async () => {
		setState((prevState) => ({
			...prevState,
			loading: false
		}))
	}

	const handleDisconnect = async () => {
		const log = await logout()
		if (log) {
			setState((prevState) => ({
				...prevState,
				userConnected: false
			}))
		}
	}

	return (
		<Fragment>
			<div className='header__spacer' />
			<header className={`header${state.menuActive ? ' header--active' : ''}`}>
				<div className='header__container container'>
					<Link href='/'>
						<a className='header__container__logoLink'>
							<img src='/portfogram-logo.svg' alt='Portfogram' className='header__container__logo' />
						</a>
					</Link>

					<ul
						className={`header__container__nav${state.menuActive
							? ` header__container__nav--active`
							: ''}`}>
						{state.userConnected ? (
							<Fragment>
								<li className='item'>
									<p className='a itemLink m-0' onClick={handleDisconnect}>
										Se déconnecter
									</p>
								</li>
								{width < 768 ? (
									<Fragment>
										<li className='item'>
											<Link href='/dashboard/profile'>
												<a className='itemLink' href=''>
													Mon profil
												</a>
											</Link>
										</li>
										<li className='item'>
											<Link href='/dashboard/projects'>
												<a className='itemLink' href=''>
													Mes projets
												</a>
											</Link>
										</li>
										<li className='item'>
											<Link href='/dashboard/skills'>
												<a className='itemLink' href=''>
													Mes compétences
												</a>
											</Link>
										</li>
									</Fragment>
								) : null}
								<li className='item'>
									<Link href='/dashboard'>
										<a>
											<Button>Dashboard</Button>
										</a>
									</Link>
								</li>
								{!state.loading ? (
									<li className='item'>
										{state.username ? (
											<Link href={`/${state.username}`}>
												<a>
													<img
														className='header__container__userPicture'
														src={state.userPicture}
														alt=''
													/>
												</a>
											</Link>
										) : (
											<img
												className='header__container__userPicture'
												src={state.userPicture}
												alt=''
											/>
										)}
									</li>
								) : (
									<Loader />
								)}
							</Fragment>
						) : (
							<Fragment>
								<li className='item'>
									<Link href='/login'>
										<a>Connexion</a>
									</Link>
								</li>
								<li className='item'>
									<Link href='/register'>
										<a>
											<Button>S'enregistrer</Button>
										</a>
									</Link>
								</li>
							</Fragment>
						)}
					</ul>
					<button
						className={`hamburger hamburger--slider${state.menuActive ? ' is-active' : ''}`}
						type='button'
						onClick={() => setState((prevState) => ({ ...prevState, menuActive: !state.menuActive }))}
						aria-label='Basculer le menu mobile'>
						<span className='hamburger-box'>
							<span className='hamburger-inner' />
						</span>
					</button>
				</div>
			</header>
		</Fragment>
	)
}

export default Header
