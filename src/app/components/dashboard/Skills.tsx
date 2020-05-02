import React, { useEffect, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/router'

import moment from 'moment'

import { filter, find, orderBy } from 'lodash'

//Context
import IUser, { getDefaultUser } from '../../constants/Interfaces/IUser'
import { getUserSnapshot } from '../../contexts/UserAuthContext/services'

//Components
import { Input, Loader, Button, PopUpConfirmation, Wizard } from '..'
import { appFirestore, appStorage, logout, firebaseApp, appAuth } from '../../services/firebase'
import { getProfileDocument } from '../../constants/firestorePath'
import ISkill from '../../constants/Interfaces/ISkill'

const Skills = () => {
	const router = useRouter()
	//UI Stuff
	const [ loading, setLoading ] = useState<boolean>(true)
	const [ shouldReload, setShouldReload ] = useState<number>(0)
	// const [ pictureLoading, setPictureLoading ] = useState<boolean>(false)

	//Error handling
	// const [ errors, setErrors ] = useState({ tagContainSpace: false })
	const [ confirmation, setConfirmation ] = useState({ error: false, show: false, message: '' })
	const [ wizard, setWizard ] = useState({ show: false, title: '', message: '', confirm: () => {} })

	//User data
	const [ user, setUser ] = useState<IUser>(getDefaultUser())
	const [ skills, setSkills ] = useState<ISkill[]>([])

	useEffect(
		() => {
			const getData = async () => {
				const userData = (await getUserSnapshot()).data()
				if (!!!userData) {
					setShouldReload(Date.now())
					return
				}

				const collectionSkills = await appFirestore()
					.doc(getProfileDocument(userData.email))
					.collection(`skills`)
					.get()

				setSkills(
					collectionSkills.docs.map((doc) => {
						return { ...doc.data(), checked: false } as ISkill
					})
				)

				setUser(userData)
				setLoading(false)
			}

			getData()
		},
		[ user.picture, user.c_picture, shouldReload ]
	)

	const uploadFile = async (fileList: FileList) => {
		if (fileList[0]) {
			const file = new File([ fileList[0] as File ], Date.now().toString(), { type: (fileList[0] as File).type })

			const imgRef = appStorage().ref().child(`users/${user.email}/skill/${file.name}`)

			const upload = imgRef.put(file)

			upload.on('state_changed', async () => {
				//Do stuff
				setShouldReload(Date.now())
			})
		}
	}

	const handleCheck = (name: string) => {
		const skill = find(skills, (skill) => skill.name === name)
		skill.checked = !skill.checked
		setSkills([ ...filter(skills, (item) => item.name !== name), skill ])
	}

	const getSkillsChecked = () => {
		return filter(skills, (skill) => skill.checked)
	}

	const handleDelete = () => {
		setWizard((prevState) => ({
			...prevState,
			show: true,
			title: `Voulez-vous vraiment supprimer ${getSkillsChecked().length} compétence ?`,
			message: 'Toutes les données associées seront supprimées et non récupérables.',
			confirm: deleteSkills
		}))
	}

	const deleteSkills = () => {
		const nbrDeleted = getSkillsChecked().length
		try {
			getSkillsChecked().forEach(async (skill) => {
				await appFirestore().doc(getProfileDocument(user.email)).collection(`skills`).doc(skill.name).delete()
			})

			setShouldReload(Date.now())

			setConfirmation((prevState) => ({
				...prevState,
				show: true,
				message: `${nbrDeleted} compétences ont été supprimées.`
			}))
		} catch (err) {}
	}

	const save = async () => {
		const newSkills = [
			{ name: 'Design', description: '', dateCreated: new Date(), iconUrl: '' },
			{ name: 'Gestion', description: '', dateCreated: new Date(), iconUrl: '' },
			{ name: 'Programmation', description: '', dateCreated: new Date(), iconUrl: '' },
			{ name: 'Intégration', description: '', dateCreated: new Date(), iconUrl: '' },
			{ name: 'React', description: '', dateCreated: new Date(), iconUrl: '' }
		]
		newSkills.forEach(async (item) => {
			const set = await appFirestore()
				.doc(getProfileDocument(user.email))
				.collection(`skills`)
				.doc(item.name)
				.set({
					name: item.name,
					description: item.description,
					dateCreated: item.dateCreated.toString(),
					iconUrl: item.iconUrl
				})
		})
	}

	return (
		<div className='pt-20 p-relative'>
			{confirmation.show ? (
				<PopUpConfirmation
					message={confirmation.message}
					error={confirmation.error}
					close={() => setConfirmation((prevState) => ({ ...prevState, show: false, message: '' }))}
				/>
			) : null}

			{wizard.show ? (
				<Wizard
					title={wizard.title}
					message={wizard.message}
					confirm={wizard.confirm}
					close={() => setWizard((prevState) => ({ ...prevState, show: false }))}
				/>
			) : null}

			<div className='dashboard__form shadow mr-25'>
				{loading ? (
					<div className='dashboard__form__loading'>
						<Loader color='#000' size={50} />
					</div>
				) : null}

				<div className='dashboard__form__header pb-10'>
					<h2>Mon compétences</h2>
					<p>Vous pouvez ajouter jusqu'à 6 compétences</p>
					<div className='actionBar'>
						<div className='actionBar__left'>
							<p>Identifiant</p>
							<p>Date d'ajout</p>
						</div>
						<div className='actionBar__right'>
							{getSkillsChecked().length === 1 ? (
								<p className='actionBar__right__btnWithIcon'>
									<img src='/icons/edit.svg' alt='' />Editer
								</p>
							) : null}

							{getSkillsChecked().length > 0 ? (
								<p className='actionBar__right__btnWithIcon' onClick={handleDelete}>
									<img src='/icons/trash--grey.svg' alt='' />
									Supprimer ({getSkillsChecked().length})
								</p>
							) : null}

							<Button action={save}>+ Ajouter</Button>
						</div>
					</div>
				</div>

				<div className='dashboard__form__content'>
					<div className='itemsList'>
						{orderBy(skills, (skill) => !skill.checked).map((skill, key) => {
							return (
								<label htmlFor={skill.name} className='itemsList__item' key={key}>
									<input
										name={skill.name}
										id={skill.name}
										type='checkbox'
										onChange={() => handleCheck(skill.name)}
									/>
									<span
										className={`itemsList__item__checkbox${skill.checked
											? ` itemsList__item__checkbox--checked`
											: ''}`}
									/>
									<div className='itemsList__item__data'>
										<p className='name'>{skill.name}</p>
										<p className='date'>{moment(skill.dateCreated).format('ll')}</p>
									</div>
								</label>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Skills
