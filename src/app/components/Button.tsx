import React from 'react'

interface IProps {
	readonly label: string
	readonly className?: string
	readonly type?: 'button' | 'submit' | 'reset'
	readonly action: (e: any) => any
}

const Button = ({ label, className, type = 'button', action }: IProps) => {
	return (
		<button className={`btn${className ? ' ' + className : ''}`} type={type} onClick={() => action}>
			{label}
		</button>
	)
}

export default Button
