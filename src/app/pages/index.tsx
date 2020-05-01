import React, { useContext, useState, useEffect, Fragment } from 'react'

//Components
import Main from '../layouts/Main'
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'
import { userAuthStateListener } from '../services/firebase'

const index = () => {
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

	return (
		<Main>
			<main className='home container'>
				{!userConnected ? (
					<Fragment>
						<h2 className='home__title h1'>Créez un portfolio simple, mais efficace</h2>
						<div className='home__hero'>
							<div className='home__hero__item'>
								<img src='/icons/register.svg' alt='' />
								<h3>Enregistrez-vous</h3>
							</div>

							<div className='home__hero__item'>
								<img src='/icons/sketch.svg' alt='' />
								<h3>Créez un compte</h3>
							</div>

							<div className='home__hero__item'>
								<img src='/icons/share.svg' alt='' />
								<h3>Partagez-le</h3>
							</div>
						</div>
					</Fragment>
				) : null}
			</main>
		</Main>
	)
}

export default index
