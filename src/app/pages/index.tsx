import React, { useContext, useState, useEffect, Fragment } from 'react'
import Link from 'next/link'

import { orderBy, take } from 'lodash'

//Context
import UserAuthContext from '../contexts/UserAuthContext/UserAuthContext'
import { userAuthStateListener, appFirestore } from '../services/firebase'

//Interfaces
import IUser from '../constants/Interfaces/IUser'
import IProject from '../constants/Interfaces/IProject'

//Components
import Main from '../layouts/Main'
import Loader from '../components/Loader'

const index = () => {
	const [ loading, setLoading ] = useState<boolean>(true)
	const { userSnapshot } = useContext(UserAuthContext)
	const [ userConnected, setUserConnected ] = useState<boolean>(false)

	const [ users, setUsers ] = useState<IUser[]>([])
	const [ projects, setProjects ] = useState<IProject[]>([])

	useEffect(
		() => {
			userAuthStateListener(userListener)

			const getContent = async () => {
				const usersColl = await appFirestore().collection('users').get()
				setUsers(
					take(usersColl.docs, 8).map((user) => {
						return user.data() as IUser
					})
				)

				const projectsCollections: IProject[] = []

				for (const user of usersColl.docs) {
					const userProjectsColl = await user.ref.collection('projects').orderBy('dateCreated', 'asc').get()
					userProjectsColl.docs.map((project) => {
						projectsCollections.push({
							id: Number(project.id),
							...project.data(),
							author: user.data()
						} as IProject)
					})
				}

				setProjects(projectsCollections)

				setLoading(false)
			}

			getContent()
		},
		[ userSnapshot ]
	)

	const userListener = async (user: any) => {
		if (user) {
			setUserConnected(true)
		}
	}

	console.log(projects)

	return (
		<Main>
			<main className='home container'>
				{!userConnected ? (
					<div className='home__hook'>
						<h2 className='home__title h1'>Créez un portfolio simple, mais efficace</h2>
						<div className='home__hero'>
							<div className='home__hero__item'>
								<img src='/icons/register.svg' alt='' />
								<h3>Enregistrez-vous</h3>
							</div>

							<div className='home__hero__item'>
								<img src='/icons/sketch.svg' alt='' />
								<h3>Créez un compte</h3>
							</div>

							<div className='home__hero__item'>
								<img src='/icons/share.svg' alt='' />
								<h3>Partagez-le</h3>
							</div>
						</div>
					</div>
				) : null}

				{loading ? (
					<div className='home__contentLoader'>
						<Loader color='#000' size={80} />
					</div>
				) : (
					<div className='home__content'>
						<div className='home__content__projects'>
							<h2 className='title'>Les derniers projets</h2>
							<div className='grid'>
								{projects.map((project, key) => {
									console.log(project)
									return (
										<Link href={`/${project.author.username}#${project.id}`} key={key}>
											<a className='grid__item'>
												<h3 className='grid__item__name'>{project.name}</h3>
												<img
													className='grid__item__img'
													src={project.images[0]}
													alt={`Couverture du projet ${project.name} par ${project.author
														.name} ${project.author.family_name}`}
												/>
											</a>
										</Link>
									)
								})}
							</div>
						</div>
						<div className='home__content__users'>
							<h2 className='title'>Les derniers utilisateurs inscrits</h2>
							<div className='list'>
								{users.map((user, key) => {
									return (
										<Link href={`/${user.username}`} key={key}>
											<a className='list__user'>
												{user.picture === 'custom' ? (
													<img
														className='list__user__picture'
														src={user.c_picture}
														alt={`Photo de profil de ${user.name} ${user.family_name}`}
													/>
												) : null}
												{user.picture === 'facebook' ? (
													<img
														className='list__user__picture'
														src={user.f_picture}
														alt={`Photo de profil de ${user.name} ${user.family_name}`}
													/>
												) : null}
												{user.picture === 'google' ? (
													<img
														className='list__user__picture'
														src={user.g_picture}
														alt={`Photo de profil de ${user.name} ${user.family_name}`}
													/>
												) : null}
												{user.picture === 'none' ? (
													<img
														className='list__user__picture'
														src='/img/userProfileImg.png'
														alt={`Photo de profil de ${user.name} ${user.family_name}`}
													/>
												) : null}
												<div className='list__user__infos'>
													<p className='name'>
														{user.name} {user.family_name}
													</p>
													<p className='link'>Voir le portfolio</p>
												</div>
											</a>
										</Link>
									)
								})}
							</div>
						</div>
					</div>
				)}
			</main>
		</Main>
	)
}

export default index
