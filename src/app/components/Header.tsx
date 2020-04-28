import React, { Fragment } from 'react'

const Header = () => {
	return (
		<Fragment>
			<div className='header__spacer' />
			<header className='header shadow'>
				<div className='header__container container'>
					<img className='header__logo' src='/logo.svg' alt='' />
				</div>
			</header>
		</Fragment>
	)
}

export default Header
