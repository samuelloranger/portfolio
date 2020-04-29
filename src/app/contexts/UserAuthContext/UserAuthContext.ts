import { createContext } from 'react'
import IUserAuthContextState from './IUserAuthContextState'

export default createContext({
	email: undefined,
	fetching: true
} as IUserAuthContextState)
