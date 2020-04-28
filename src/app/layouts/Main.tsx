import React from 'react'

//Components
import { Header } from '../components/'

interface IProps {
	children: JSX.Element
}

const Main = ({ children }: IProps) => {
	return (
		<div>
			<Header />
			{children}
		</div>
	)
}

export default Main
