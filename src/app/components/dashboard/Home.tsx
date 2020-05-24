import { useEffect, useState, Fragment } from 'react'

//Services
import { getUserSnapshot } from '../../contexts/UserAuthContext/services'
import { appFirestore } from '../../services/firebase'
import { getProfileDocument } from '../../constants/firestorePath'

//Interface
import IUser, { getDefaultUser } from '../../constants/Interfaces/IUser'
import ISkill from '../../constants/Interfaces/ISkill'
import IProject from '../../constants/Interfaces/IProject'
import Loader from 'react-spinners/ClipLoader'
import Link from 'next/link'

const Home = () => {
	const [ loading, setLoading ] = useState<boolean>(true)
	const [ user, setUser ] = useState<IUser>(getDefaultUser())

	const [ projects, setProjects ] = useState<IProject[]>([])
	const [ skills, setSkills ] = useState<ISkill[]>([])

	useEffect(
		() => {
			const getContent = async () => {
				const userData = (await getUserSnapshot()).data()

				setUser(userData)

				const collectionProjects = await appFirestore()
					.doc(getProfileDocument(userData.email))
					.collection(`projects`)
					.get()

				setProjects(
					collectionProjects.docs.map((project) => {
						return { id: Number(project.id), ...project.data() } as IProject
					})
				)

				const collectionSkills = await appFirestore()
					.doc(getProfileDocument(userData.email))
					.collection(`skills`)
					.get()

				setSkills(
					collectionSkills.docs.map((skill) => {
						return { id: Number(skill.id), ...skill.data() } as ISkill
					})
				)

				setLoading(false)
			}

			getContent()
		},
		[ getUserSnapshot ]
	)

	if (loading) {
		return (
			<div className='pt-25'>
				<Loader color='#000' size={50} />
			</div>
		)
	}

	return (
		<div className='pt-20 p-relative'>
			<div className='dashboard__form shadow pb-15'>
				<div className='dashboard__form__header'>
					<h2>Mon portolio</h2>
				</div>

				<div className='dashboard__form__content dashboard__home pt-15'>
					<div className='pl-25 dashboard__home__userInfos'>
						<h3 className='titleSection'>Mon profil</h3>
						<p>
							<b>Mon nom d'utilisateur: </b>
							{user.username}
						</p>
						<p>
							<b>Mon nom: </b>
							{user.name} {user.family_name}
						</p>
						<p>
							<b>Mon courriel: </b>
							{user.email}
						</p>
						<p>
							<b>Ma description: </b>
							{user.description ? user.description : 'Aucune description entrée.'}
						</p>
						<p>
							<b>Mon location: </b>
							{user.location ? user.location : 'Aucun location entrée'}
						</p>
						<p>
							<b>Mon poste: </b>
							{user.poste ? user.poste : 'Aucun poste entré'}
						</p>
						<p>
							<b>Mon employeur: </b>
							{user.employeur ? user.employeur : 'Aucun employeur entré'}
						</p>
					</div>

					<div className='pl-25'>
						<h3 className='titleSection'>Mes projets</h3>
						{projects.map((project) => {
							return (
								<Link href={`/dashboard/projects?edit=${project.id}`} key={project.id}>
									<a className='listItem'>
										<img src='/icons/edit.svg' alt='Éditer le projet' />
										<p>{project.name}</p>
									</a>
								</Link>
							)
						})}
					</div>

					<div className='pl-25'>
						<h3 className='titleSection'>Mes compétences</h3>
						{skills.map((skill) => {
							return (
								<Link href={`/dashboard/skills?edit=${skill.id}`} key={skill.id}>
									<a className='listItem'>
										<img src='/icons/edit.svg' alt='Éditer la compétence' />
										<p>{skill.name}</p>
									</a>
								</Link>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
