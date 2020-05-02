import React, { useEffect, useState } from 'react'

interface IProps {
	readonly error?: boolean
	readonly message: string
	readonly close: () => void
}

const PopUpConfirmation = ({ error = false, message, close }: IProps) => {
	const [ state, setState ] = useState({ timer: undefined, closing: true, appear: true })

	useEffect(() => {
		setState((prevState) => ({
			...prevState,
			closing: false,
			timer: setTimeout(() => {
				handleClose()
			}, 4500)
		}))

		setState((prevState) => ({
			...prevState,
			closing: false,
			timer: setTimeout(() => {
				handleClose()
			}, 4500)
		}))

		return () => {
			clearTimeout(state.timer)
			setState((prevState) => ({
				...prevState,
				timer: undefined
			}))
		}
	}, [])

	const handleClose = () => {
		setState((prevState) => ({
			...prevState,
			closing: true
		}))

		setTimeout(() => {
			close()
		}, 1000)
	}

	return (
		<span
			className={`popUpConfirmation${state.closing ? ' popUpConfirmation--closing' : ''}${state.appear
				? ' popUpConfirmation--appear'
				: ''}`}>
			<img src={`/icons/${error ? 'incorrect' : 'correct'}.svg`} alt='' />
			{message}
		</span>
	)
}

export default PopUpConfirmation
