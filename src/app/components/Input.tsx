import React, { ChangeEvent, useState } from 'react'

interface IProps {
	readonly label: string
	readonly name: string
	readonly className?: string
	readonly type?: string
	readonly defaultChecked?: boolean
	readonly onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const Input = ({ label, className, name, onChange, defaultChecked, type = 'text' }: IProps) => {
	const [ showPw, setShowPw ] = useState(false)

	if (type === 'checkbox') {
		return (
			<div className={`inputfield--checkbox${className ? ' ' + className : ''}`}>
				<label htmlFor={name}>
					<input name={name} id={name} defaultChecked={defaultChecked} type={type} />
					<span />
					{label}
				</label>
			</div>
		)
	}

	return (
		<div className={`inputField pl-25 pr-25 pt-25${className ? ' ' + className : ''}`}>
			<label htmlFor={name}>{label}</label>
			{type === 'password' ? (
				<img
					src={`/icons/${!showPw ? 'eye-open' : 'eye-closed'}.svg`}
					alt='Afficher le mot de passe'
					className='inputField__eye'
					onClick={() => setShowPw(!showPw)}
				/>
			) : null}
			<input
				name={name}
				id={name}
				type={type === 'password' ? !showPw ? 'password' : 'text' : type}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e)}
			/>
		</div>
	)
}

export default Input