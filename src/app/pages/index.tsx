import React from 'react'

//Components
import Main from '../layouts/Main'

const index = () => {
	return (
		<Main>
			<main className='home container'>
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
			</main>
		</Main>
	)
}

export default index
