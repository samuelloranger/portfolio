import { useState, useEffect } from 'react'
import IUser from '../constants/Interfaces/IUser'
import IProject from '../constants/Interfaces/IProject'
import ISkill from '../constants/Interfaces/ISkill'
import { appFirestore, appStorage } from '../services/firebase'
import Main from '../layouts/Main'

interface IProps {
	readonly user?: IUser
	readonly tags?: string[]
	readonly projects?: IProject[]
	readonly skills?: ISkill[]
	readonly notFound: boolean
}

const portfolio = ({ user, tags, projects, skills, notFound }) => {
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
					const customPicture = await appStorage().ref(user.c_picture).getDownloadURL()
					setUserPicture(customPicture)
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
						<p className='info'>
							<img className='info__icon' src='/icons/pin.svg' alt='' />Québec, Canada
						</p>
						{user.description && <p className='info__description'>{user.description}</p>}

						<p className='tags'>
							{tags.map((tag: string) => {
								return <span className='tags__tag'>#{tag}</span>
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
								<div key={key}>
									<h3>{project.name}</h3>
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
