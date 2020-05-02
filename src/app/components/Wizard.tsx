import React, { Fragment, useState, useEffect } from 'react'
import { Button } from '.'

interface IProps {
	readonly title: string
	readonly message: string
	readonly confirm: () => void
	readonly close: () => void
}

const Wizard = ({ title, message, confirm, close }: IProps) => {
	const [ state, setState ] = useState({ closing: false, timer: undefined })

	useEffect(() => {
		return () => {
			clearTimeout(state.timer)
			setState((prevState) => ({ ...prevState, timer: undefined }))
		}
	}, [])

	const handleClose = () => {
		setState((prevState) => ({
			...prevState,
			closing: true,
			timer: setTimeout(() => {
				close()
			}, 500)
		}))
	}

	return (
		<div className={`wizard${state.closing ? ' ' + 'wizard--closing' : ''}`}>
			<div className='wizard__container'>
				<p className='h3'>{title}</p>
				<p>{message}</p>

				<div className='wizard__container__buttons'>
					<p className='a' onClick={handleClose}>
						Annuler
					</p>
					<Button action={confirm} className='btn--red'>
						<Fragment>
							<img src='/icons/trash.svg' alt='' /> Supprimer
						</Fragment>
					</Button>
				</div>
			</div>
		</div>
	)
}

export default Wizard
