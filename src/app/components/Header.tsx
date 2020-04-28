import React, { Fragment } from 'react'

//Components
import { Button } from './'

const Header = () => {
	return (
		<Fragment>
			<div className='header__spacer' />
			<header className='header shadow'>
				<div className='header__container container'>
					<h1 className='header__container__logo'>PORTFOGRAM</h1>

					<Button label='Se connecter' action={() => console.log('click')} />
				</div>
			</header>
		</Fragment>
	)
}

export default Header
