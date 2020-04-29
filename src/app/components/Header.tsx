import React, { useEffect, useState, useContext, Fragment } from 'react'
import Link from 'next/link'

//Components
import { Button } from './'

//Context
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'

//Firebase
import { logout, userAuthStateListener } from '../services/firebase'

const Header = () => {
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

	const handleDisconnect = async () => {
		const log = await logout()
		if (log) {
			setUserConnected(false)
		}
	}

	return (
		<Fragment>
			<div className='header__spacer' />
			<header className='header shadow'>
				<div className='header__container container'>
					<Link href='/'>
						<a className='header__container__logoLink'>
							<h1 className='header__container__logo'>PORTFOGRAM</h1>
						</a>
					</Link>

					{userConnected ? (
						<ul className='header__container__nav'>
							<li className='item'>
								<p onClick={handleDisconnect}>Se déconnecter</p>
							</li>
							<li className='item'>
								<Link href='/dashboard'>
									<a>
										<Button label='Dashboard' />
									</a>
								</Link>
							</li>
						</ul>
					) : (
						<ul className='header__container__nav'>
							<li className='item'>
								<Link href='/login'>
									<a>Connexion</a>
								</Link>
							</li>
							<li className='item'>
								<Link href='/register'>
									<a>
										<Button label='S&#39;enregistrer' />
									</a>
								</Link>
							</li>
						</ul>
					)}
				</div>
			</header>
		</Fragment>
	)
}

export default Header
