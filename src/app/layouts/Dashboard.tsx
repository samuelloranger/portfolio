import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { find } from 'lodash'

//Layout
import Main from './Main'

//Services
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'
import { userAuthStateListener } from '../services/firebase'

//Components
import LoginPageComponent from '../components/LoginPageComponent'
import Loader from 'react-spinners/ClipLoader'

import { Profile, Projects, Skills, Home } from '../components/dashboard'

const Dashboard = () => {
	const router = useRouter()
	const [ loading, setLoading ] = useState<boolean>(true)
	const { userSnapshot } = useContext(UserAuthContext)
	const [ userConnected, setUserConnected ] = useState<boolean>(false)

	const pages = [
		{
			url: '/dashboard/index',
			iconName: 'home',
			name: 'Home',
			component: <Home />
		},
		{
			url: '/dashboard/profile',
			iconName: 'user',
			name: 'Mon profil',
			component: <Profile />
		},
		{
			url: '/dashboard/projects',
			iconName: 'projects',
			name: 'Mes projets',
			component: <Projects />
		},
		{
			url: '/dashboard/skills',
			iconName: 'skills',
			name: 'Mes compétences',
			component: <Skills />
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

		setLoading(false)
	}

	if (loading) {
		return (
			<Main>
				<div className='dashboard__loading'>
					<Loader color='#000' size={50} />
				</div>
			</Main>
		)
	}

	if (!userConnected) {
		return (
			<Main>
				<LoginPageComponent />
			</Main>
		)
	}

	const getPage = (): JSX.Element => {
		const currentPage = find(pages, (page) => page.url === router.pathname)
		if (!!!currentPage) return pages[0].component
		return currentPage.component
	}

	return (
		<Main>
			<div className='dashboard'>
				<div className='dashboard__sidebar'>
					<ul className='dashboard__sidebar__nav'>
						{pages.map((item, key) => {
							if (item.name === 'Home') {
								return null
							}
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
				<div className='dashboard__content'>
					<div className='container'>{getPage()}</div>
				</div>
			</div>
		</Main>
	)
}

export default Dashboard
