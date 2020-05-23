import { useEffect, useState, ChangeEvent, Fragment } from 'react'
import { useRouter } from 'next/router'

import moment from 'moment'

import { filter, find } from 'lodash'

//Context
import IUser, { getDefaultUser } from '../../constants/Interfaces/IUser'
import { getUserSnapshot } from '../../contexts/UserAuthContext/services'

//Components
import { Input, Loader, Button, PopUpConfirmation, Wizard } from '..'
import { appFirestore, appStorage } from '../../services/firebase'
import { getProfileDocument } from '../../constants/firestorePath'
import ISkill, { getDefaultSkill } from '../../constants/Interfaces/ISkill'

interface IProps {
	readonly query: any
}

const Skills = ({ query }: IProps) => {
	const router = useRouter()
	//UI Stuff
	const [ loading, setLoading ] = useState<boolean>(true)
	const [ pictureLoading, setPictureLoading ] = useState<boolean>(false)

	//Error handling
	const [ errors, setErrors ] = useState({
		skillNeedsIcon: false,
		skillNeedsName: false,
		skillNeedsDescription: false,
		skillIconFormat: false
	})
	const [ confirmation, setConfirmation ] = useState({ error: false, show: false, message: '' })
	const [ wizard, setWizard ] = useState({ show: false, title: '', message: '', confirm: () => {} })
	const [ showForm, setShowForm ] = useState<boolean>(false)

	//User data
	const [ user, setUser ] = useState<IUser>(getDefaultUser())
	const [ skills, setSkills ] = useState<ISkill[]>([])
	const [ newSkill, setNewSkill ] = useState<ISkill>(getDefaultSkill())
	const [ editMode, setEditMode ] = useState<boolean>(false)

	useEffect(
		() => {
			let unSubscribedCollectionSkills

			const getData = async () => {
				const userData = (await getUserSnapshot()).data()
				setUser(userData)

				unSubscribedCollectionSkills = appFirestore()
					.doc(getProfileDocument(userData.email))
					.collection(`skills`)
					.onSnapshot(setSkillsData)
			}

			getData()

			return () => {
				unSubscribedCollectionSkills()
			}
		},
		[ user.picture, user.c_picture ]
	)

	const setSkillsData = async (colectionSkillsSnap: firebase.firestore.QuerySnapshot) => {
		setSkills(
			colectionSkillsSnap.docs.map((doc) => {
				return { id: Number(doc.id), ...doc.data(), checked: false } as ISkill
			})
		)
		setLoading(false)
	}

	useEffect(
		() => {
			const getData = async () => {
				const userData = (await getUserSnapshot()).data()
				const skillToEdit = await appFirestore()
					.doc(getProfileDocument(userData.email))
					.collection(`skills`)
					.doc(query.edit)
					.get()

				setNewSkill({ id: Number(skillToEdit.id), ...skillToEdit.data() } as ISkill)
				setShowForm(true)
				setEditMode(true)
			}

			if (!!!query.edit) return
			getData()
		},
		[ query ]
	)

	const setupImgUpload = async (fileList: FileList) => {
		setPictureLoading(true)
		if (fileList[0]) {
			const file = new File([ fileList[0] as File ], Date.now().toString(), { type: (fileList[0] as File).type })

			const imgRef = appStorage().ref().child(`users/${user.email}/skill/${file.name}`)

			if (file.type !== 'image/svg+xml') {
				setErrors((prevState) => ({ ...prevState, skillIconFormat: true }))
				setPictureLoading(false)
			} else {
				const upload = imgRef.put(file)
				upload.on('state_changed', async () => {
					const fileUrl = await upload.snapshot.ref.getDownloadURL()
					setNewSkill((prevState) => ({
						...prevState,
						iconUrl: fileUrl
					}))
					setPictureLoading(false)
				})
			}
		}
	}

	const handleCheck = (name: string) => {
		setSkills((prevState) =>
			prevState.map((skill) => {
				if (skill.name !== name) {
					return skill
				}
				return { ...skill, checked: !skill.checked }
			})
		)
	}

	const getSkillsChecked = () => {
		return filter(skills, (skill) => skill.checked)
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement

		setNewSkill((prevState) => ({ ...prevState, [input.name]: input.value }))
	}

	const handleDelete = () => {
		setWizard((prevState) => ({
			...prevState,
			show: true,
			title: `Voulez-vous vraiment supprimer ${getSkillsChecked().length} compétence${getSkillsChecked().length >
			1
				? 's'
				: ''} ?`,
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

			setConfirmation((prevState) => ({
				...prevState,
				show: true,
				message: `${nbrDeleted} compétences ont été supprimées.`
			}))
		} catch (err) {}
	}

	const handleEdit = () => {
		setNewSkill(find(skills, (skill) => skill.checked === true))
		setShowForm(true)
		setEditMode(true)
	}

	const verifyErrors = () => {
		let formContainsErrors = false

		if (newSkill.iconUrl === '/icons/uploadImage.svg') {
			formContainsErrors = true
			setErrors((prevState) => ({ ...prevState, skillNeedsIcon: true }))
		} else {
			formContainsErrors = false
			setErrors((prevState) => ({ ...prevState, skillNeedsIcon: false }))
		}

		if (!!!newSkill.name) {
			formContainsErrors = true
			setErrors((prevState) => ({ ...prevState, skillNeedsName: true }))
		} else {
			if (formContainsErrors !== true) {
				formContainsErrors = false
			}
			setErrors((prevState) => ({ ...prevState, skillNeedsName: false }))
		}

		if (!!!newSkill.description) {
			formContainsErrors = true
			setErrors((prevState) => ({ ...prevState, skillNeedsDescription: true }))
		} else {
			if (formContainsErrors !== true) {
				formContainsErrors = false
			}
			setErrors((prevState) => ({ ...prevState, skillNeedsDescription: false }))
		}

		return formContainsErrors
	}

	const handleSubmit = async () => {
		setLoading(true)

		if (!verifyErrors()) {
			if (editMode) {
				await appFirestore()
					.doc(getProfileDocument(user.email))
					.collection(`skills`)
					.doc(newSkill.id.toString())
					.update({
						id: newSkill.id,
						name: newSkill.name,
						description: newSkill.description,
						iconUrl: newSkill.iconUrl
					})

				setEditMode(false)

				setConfirmation((prevState) => ({
					...prevState,
					show: true,
					message: `La compétence a été mise à jour.`
				}))

				setNewSkill(getDefaultSkill())
			} else {
				await appFirestore()
					.doc(getProfileDocument(user.email))
					.collection(`skills`)
					.doc(Date.now().toString())
					.set({
						name: newSkill.name,
						description: newSkill.description,
						dateCreated: newSkill.dateCreated.toString(),
						iconUrl: newSkill.iconUrl
					})

				setConfirmation((prevState) => ({
					...prevState,
					show: true,
					message: `La compétence a été ajoutée.`
				}))
			}

			setShowForm(false)
		} else {
			setLoading(false)
		}
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
					{showForm ? (
						<Fragment>
							<h2>Compétence</h2>
						</Fragment>
					) : (
						<Fragment>
							<h2>Mes compétences</h2>
							<p>Vous pouvez ajouter jusqu'à 6 compétences</p>
							<div className='actionBar'>
								<div className='actionBar__left'>
									<p>Identifiant</p>
									<p>Date d'ajout</p>
								</div>
								<div className='actionBar__right'>
									{getSkillsChecked().length === 1 ? (
										<p className='actionBar__right__btnWithIcon' onClick={handleEdit}>
											<img src='/icons/edit.svg' alt='' />Éditer
										</p>
									) : null}

									{getSkillsChecked().length > 0 ? (
										<p className='actionBar__right__btnWithIcon' onClick={handleDelete}>
											<img src='/icons/trash--grey.svg' alt='' />
											Supprimer ({getSkillsChecked().length})
										</p>
									) : null}

									<Button action={() => setShowForm(true)}>+ Ajouter</Button>
								</div>
							</div>
						</Fragment>
					)}
				</div>

				<div className='dashboard__form__content'>
					{showForm ? (
						<form className='form'>
							<div className='form__fields'>
								<div className='form__fields__left'>
									<Input
										label='Nom de la compétence'
										name='name'
										value={newSkill.name}
										onChange={handleChange}
									/>
									{errors.skillNeedsName ? (
										<p className='error pl-25'>Vous devez entrer un nom pour cette compétence.</p>
									) : null}

									<Input
										label='Description de la compétence'
										name='description'
										type='textarea'
										maxLength={500}
										value={newSkill.description}
										onChange={handleChange}
									/>
									{errors.skillNeedsDescription ? (
										<p className='error pl-25'>
											Vous devez entrer une description pour cette compétence.
										</p>
									) : null}
								</div>
								<div className='form__fields__right'>
									<div className='skillImg inputField pl-25 pr-25 pt-25'>
										<label htmlFor='skillIcon'>Icône de la compétence</label>
										<p>
											Nous vous conseillons de téléverser un icône en noir en blanc, avec un filet
											mince. <strong>Fichiers SVG seulement.</strong>
										</p>
										<label htmlFor='skillImg'>
											<input
												name='skillImg'
												id='skillImg'
												type='file'
												onChange={(e) =>
													setupImgUpload((e.currentTarget as HTMLInputElement)
														.files as FileList)}
											/>
											<div className='skillIcon__uploadZone inputField__uploadZone'>
												<img src={newSkill.iconUrl} />
												{pictureLoading && (
													<div className='loader'>
														<Loader size={16} color='#1a73e8' />
													</div>
												)}
											</div>
										</label>

										{errors.skillIconFormat ? (
											<p className='error'>Vous devez choisir un icône au format SVG.</p>
										) : null}

										{errors.skillNeedsIcon && !errors.skillIconFormat ? (
											<p className='error'>Vous devez choisir un icône pour cette compétence.</p>
										) : null}
									</div>
								</div>
							</div>

							<div className='form__buttons pb-15'>
								<Button action={handleSubmit}>{editMode ? 'Enregistrer' : '+ Ajouter'}</Button>
								<p
									className='a'
									onClick={() => {
										setShowForm(false)
										setNewSkill(getDefaultSkill())
									}}>
									Annuler
								</p>
							</div>
						</form>
					) : (
						<div className='itemsList'>
							{skills.length === 0 ? (
								<p className='pl-25 pr-15'>
									Il n'y a aucune compétence à votre profil ! Ajoutez-en une.
								</p>
							) : (
								skills.map((skill, key) => {
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
								})
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default Skills
