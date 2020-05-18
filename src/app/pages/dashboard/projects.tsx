import React from 'react'
import Dashboard from '../../layouts/Dashboard'

interface IProps {
	readonly query: any
}

const projects = ({ query }: IProps) => {
	return <Dashboard query={query} />
}

projects.getInitialProps = async ({ query }) => {
	return { query }
}

export default projects
