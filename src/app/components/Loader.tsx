import React from 'react'
import ClipLoader from 'react-spinners/ClipLoader'

interface IProps {
	readonly color?: string
	readonly size?: number
}

const Loader = ({ color = '#fff', size = 22 }: IProps) => {
	return <ClipLoader size={size} color={color} loading={true} />
}
export default Loader
