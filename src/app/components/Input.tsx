import React, { ChangeEvent, useState } from 'react'

interface IProps {
	readonly label: string
	readonly name: string
	readonly className?: string
	readonly type?: string
	readonly defaultChecked?: boolean
	readonly value: string
	readonly pattern?: string
	readonly error?: JSX.Element | null
	readonly maxLength?: number
	readonly onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const Input = ({
	label,
	className,
	name,
	onChange,
	error,
	defaultChecked,
	value,
	pattern,
	type = 'text',
	maxLength
}: IProps) => {
	const [ showPw, setShowPw ] = useState(false)
	const [ charsLeft, setCharsLeft ] = useState<number>(maxLength)

	const onChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const input = e.currentTarget as HTMLTextAreaElement
		setCharsLeft(maxLength - input.value.length)
		onChange(e)
	}

	if (type === 'textarea') {
		return (
			<div className='inputField--textarea pl-25 pr-25 pt-25'>
				<label htmlFor={name}>{label}</label>
				<span className='charsLeft'>
					{charsLeft} / {}
					{maxLength}
				</span>
				<textarea name={name} id={name} maxLength={maxLength} value={value} onChange={onChangeTextArea} />
			</div>
		)
	}

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
		<div className={`inputField${className ? ' ' + className : ' pl-25 pr-25 pt-25'}`}>
			<label htmlFor={name}>{label}</label>
			{type === 'password' ? (
				<img
					src={`/icons/${!showPw ? 'eye-open' : 'eye-closed'}.svg`}
					alt='Afficher le mot de passe'
					className='inputField__eye'
					onClick={() => setShowPw(!showPw)}
				/>
			) : null}
			{error}
			<input
				name={name}
				id={name}
				pattern={pattern ? pattern : ''}
				value={value ? value : ''}
				autoComplete={type === 'password' ? 'current-password' : 'on'}
				type={type === 'password' ? !showPw ? 'password' : 'text' : type}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e)}
			/>
		</div>
	)
}

export default Input
