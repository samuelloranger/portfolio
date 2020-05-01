import React, { useEffect, useState, useContext, Fragment } from 'react'
import Link from 'next/link'

//Components
import { Button } from './'

//Context
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'

//Firebase
import { logout, userAuthStateListener } from '../services/firebase'
import useWindowSize from '../constants/Hooks/useWindow'

const Header = () => {
	const { width } = useWindowSize()
	const { userSnapshot } = useContext(UserAuthContext)
	const [ userConnected, setUserConnected ] = useState<boolean>(false)
	const [ state, setState ] = useState({ menuActive: false })

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

	const handleDisconnect = async () => {
		const log = await logout()
		if (log) {
			setUserConnected(false)
		}
	}

	return (
		<Fragment>
			<div className='header__spacer' />
			<header className={`header${state.menuActive ? ' header--active' : ''}`}>
				<div className='header__container container'>
					<Link href='/'>
						<a className='header__container__logoLink'>
							<h1 className='header__container__logo'>PORTFOGRAM</h1>
						</a>
					</Link>

					<ul
						className={`header__container__nav${state.menuActive
							? ` header__container__nav--active`
							: ''}`}>
						{userConnected ? (
							<Fragment>
								<li className='item'>
									<p className='a itemLink m-0' onClick={handleDisconnect}>
										Se déconnecter
									</p>
								</li>
								{width < 768 ? (
									<Fragment>
										<li className='item'>
											<Link href='/dashboard'>
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
											<Link href='/dashboard/'>
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
						onClick={() => setState((prevState) => ({ ...prevState, menuActive: !state.menuActive }))}>
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
