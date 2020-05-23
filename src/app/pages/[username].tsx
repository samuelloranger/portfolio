import { useState, useEffect } from 'react'
import { take } from 'lodash'
import { NextSeo } from 'next-seo'

//Interfaces
import IUser from '../constants/Interfaces/IUser'
import IProject from '../constants/Interfaces/IProject'
import ISkill from '../constants/Interfaces/ISkill'

//Services
import { appFirestore } from '../services/firebase'

//Components
import Main from '../layouts/Main'
import Slider from '../components/Slider'

interface IProps {
	readonly user?: IUser
	readonly tags?: string[]
	readonly projects?: IProject[]
	readonly skills?: ISkill[]
	readonly notFound: boolean
}

const portfolio = ({ user, tags, projects, skills, notFound }: IProps) => {
	const [ userPicture, setUserPicture ] = useState<string>('')

	useEffect(() => {
		const getProfilePictureUrl = async () => {
			switch (user.picture) {
				case 'google':
					setUserPicture(user.g_picture)
					break
				case 'facebook':
					setUserPicture(user.f_picture)
					break
				case 'custom':
					setUserPicture(user.c_picture)
					break
				case 'none':
					setUserPicture('/img/userProfileImg.png')
					break
			}
		}
		getProfilePictureUrl()
	}, [])

	return (
		<Main>
			<div className='portfolio container pt-25'>
				<NextSeo
					title={`${user.name} ${user.family_name} | Portfogram`}
					description='Regardez mon portfolio sur Portfogram!'
					canonical={`https://samuelloranger.com/${user.username}`}
					openGraph={{
						url: 'https://samuelloranger.com/',
						title: 'Portfogram',
						description: 'Regardez mon portfolio sur Portfogram!',
						images: [
							{
								url: '/og-image.jpg',
								width: 800,
								height: 600,
								alt: 'Portfogram | Créez un portfolio simple, mais efficace.'
							}
						],
						site_name: 'Portfogram'
					}}
				/>

				<div className='portfolio__userInfos'>
					<div className='portfolio__userInfos__header'>
						<img src={userPicture} alt='' className='picture shadow' />
						<h1 className='name'>
							<span className='first_name'>{user.name ? user.name : ''}</span>
							<span className='last_name'>{user.family_name}</span>
						</h1>
					</div>

					<div className='portfolio__userInfos__details'>
						{user.poste || user.employeur ? (
							<p className='info'>
								<img className='info__icon' src='/icons/work.svg' alt='' />
								{user.poste && user.poste}
								{user.poste && user.employeur ? ', ' : ''}
								{user.employeur && user.employeur}
							</p>
						) : null}
						{user.location && (
							<p className='info'>
								<img className='info__icon' src='/icons/pin.svg' alt='' />
								{user.location}
							</p>
						)}

						{user.description && <p className='info__description'>{user.description}</p>}

						<p className='tags'>
							{tags.map((tag: string, key) => {
								return (
									<span key={key} className='tags__tag'>
										#{tag}
									</span>
								)
							})}
						</p>
					</div>
				</div>

				<div className='portfolio__skills'>
					{skills &&
						skills.map((skill: ISkill, key: number) => {
							return (
								<div className='portfolio__skills__skill' key={key}>
									<img className='picture' src={skill.iconUrl} alt='' />
									<h3 className='title'>{skill.name}</h3>
									<p className='description'>{skill.description}</p>
								</div>
							)
						})}
				</div>

				<div className='portfolio__projects'>
					{projects &&
						projects.map((project: IProject, key: number) => {
							return (
								<div className='portfolio__projects__project' key={key}>
									<span className='ancre' id={project.id.toString()} />
									<Slider images={take(project.images, 5)} />
									<div className='projectInfos'>
										<h3 className='title'>{project.name}</h3>
										<p className='description'>{project.description}</p>
									</div>
								</div>
							)
						})}
				</div>
			</div>
		</Main>
	)
}

portfolio.getInitialProps = async ({ asPath }) => {
	const user = await appFirestore().collection(`users`).where('username', '==', asPath.slice(1, asPath.length)).get()

	if (!!!user.docs.length) return { notFound: true }
	const userData = user.docs[0].data() as IUser

	const skillsColl = await user.docs[0].ref.collection('skills').get()
	const skillsData = skillsColl.docs.map((skill) => {
		return { id: skill.id, ...skill.data() }
	})

	const projectsColl = await user.docs[0].ref.collection('projects').get()
	const projectsData = projectsColl.docs.map((project) => {
		return { id: project.id, ...project.data() }
	})

	const tagsColl = await user.docs[0].ref.collection('tags').get()
	const tagsData = tagsColl.docs.map((tag) => {
		return tag.data().tag
	})

	return { user: userData, tags: tagsData, skills: skillsData, projects: projectsData, notFound: false }
}

export default portfolio
