import React from 'react'
import ClipLoader from 'react-spinners/ClipLoader'

interface IProps {
	readonly color?: string
}

const Loader = ({ color = '#fff' }: IProps) => {
	return <ClipLoader size={22} color={color} loading={true} />
}
export default Loader
