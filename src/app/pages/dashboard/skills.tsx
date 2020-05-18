import React from 'react'
import Dashboard from '../../layouts/Dashboard'

interface IProps {
	readonly query: any
}

const skills = ({ query }: IProps) => {
	return <Dashboard query={query} />
}

skills.getInitialProps = async ({ query }) => {
	return { query }
}

export default skills
