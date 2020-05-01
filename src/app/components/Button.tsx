import React from 'react'

interface IProps {
	readonly children: string | JSX.Element
	readonly className?: string
	readonly type?: 'button' | 'submit' | 'reset'
	readonly action?: () => void
}

const Button = ({ children, className, type = 'button', action }: IProps) => {
	return (
		<button className={`btn${className ? ' ' + className : ''}`} type={type} onClick={action}>
			{children}
		</button>
	)
}

export default Button
