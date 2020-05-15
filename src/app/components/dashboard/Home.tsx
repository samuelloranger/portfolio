import { useEffect, useState } from 'react'

import IUser from '../../constants/Interfaces/IUser'
import IProjet from '../../constants/Interfaces/IProject'
import ISkill from '../../constants/Interfaces/ISkill'
import { userAuthStateListener, appFirestore } from '../../services/firebase'

const Home = () => {
	const [ user, setUser ] = useState<IUser>(getDefaultUser())

	const [ users, setUsers ] = useState<IUser[]>([])
	const [ projects, setProjects ] = useState<IProject[]>([])
	const [ skills, setSkills ] = useState<ISkill[]>([])

	useEffect(
		() => {
			userAuthStateListener(userListener)

			const getContent = async () => {}

			getContent()
		},
		[ userSnapshot ]
	)

	const userListener = async (user: any) => {
		if (user) {
			setUserConnected(true)
		}
	}

	console.log(skills, user)
	return (
		<div>
			<h1 className='h2'>Votre portfolio</h1>
		</div>
	)
}

export default Home
