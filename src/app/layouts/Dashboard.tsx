import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

//Layout
import Main from './Main'

//Services
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'
import { userAuthStateListener } from '../services/firebase'

//Components
import LoginPageComponent from '../components/LoginPageComponent'

interface IProps {
	readonly children: JSX.Element
}

const Dashboard = ({ children }: IProps) => {
	const router = useRouter()
	const { userSnapshot } = useContext(UserAuthContext)
	const [ userConnected, setUserConnected ] = useState<boolean>(false)

	const links = [
		{
			url: '/dashboard',
			iconName: 'user',
			name: 'Mon profil'
		},
		{
			url: '/dashboard/projects',
			iconName: 'projects',
			name: 'Mes projets'
		},
		{
			url: '/dashboard/skills',
			iconName: 'skills',
			name: 'Mes compétences'
		}
	]

	useEffect(
		() => {
			userAuthStateListener(userListener)
		},
		[ userSnapshot ]
	)

	const userListener = async (user: any) => {
		if (user) {
			setUserConnected(true)
		}
	}

	if (!userConnected) {
		return (
			<Main>
				<LoginPageComponent />
			</Main>
		)
	}

	return (
		<Main>
			<div className='dashboard'>
				<div className='dashboard__sidebar'>
					<ul className='dashboard__sidebar__nav'>
						{links.map((item, key) => {
							return (
								<Link href={item.url} key={key}>
									<a
										className={`itemLink${item.url === router.pathname ? ' itemLink--active' : ''}`}
										href=''>
										<img src={`/icons/${item.iconName}.svg`} alt='' />
										{item.name}
									</a>
								</Link>
							)
						})}
						<li className='item' />
					</ul>
				</div>
				<div className='dashboard__content'>{children}</div>
			</div>
		</Main>
	)
}

export default Dashboard
