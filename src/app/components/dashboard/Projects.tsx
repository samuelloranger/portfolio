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
import IProject, { getDefaultProject } from '../../constants/Interfaces/IProject'

interface IProps {
	query: any
}

const Projects = ({ query }: IProps) => {
	const router = useRouter()
	//UI Stuff
	const [ loading, setLoading ] = useState<boolean>(true)
	const [ shouldReload, setShouldReload ] = useState<number>(0)
	const [ pictureLoading, setPictureLoading ] = useState<boolean>(false)

	//Error handling
	const [ errors, setErrors ] = useState({
		projectNeedsImage: false,
		projectNeedsName: false,
		projectNeedsDescription: false,
		projectImageFormat: false
	})
	const [ confirmation, setConfirmation ] = useState({ error: false, show: false, message: '' })
	const [ wizard, setWizard ] = useState({ show: false, title: '', message: '', confirm: () => {} })
	const [ showForm, setShowForm ] = useState<boolean>(false)

	//User data
	const [ user, setUser ] = useState<IUser>(getDefaultUser())
	const [ projects, setProjects ] = useState<IProject[]>([])
	const [ newProject, setNewProject ] = useState<IProject>(getDefaultProject())
	const [ editMode, setEditMode ] = useState<boolean>(false)

	useEffect(
		() => {
			const getData = async () => {
				const userData = (await getUserSnapshot()).data()
				if (!!!userData) {
					setShouldReload(Date.now())
					return
				}

				const collectionProjects = await appFirestore()
					.doc(getProfileDocument(userData.email))
					.collection(`projects`)
					.get()

				setProjects(
					collectionProjects.docs.map((doc) => {
						return { id: Number(doc.id), ...doc.data(), checked: false } as IProject
					})
				)

				setUser(userData)
				setLoading(false)
			}

			getData()
		},
		[ user.picture, user.c_picture, shouldReload ]
	)

	useEffect(
		() => {
			const getData = async () => {
				const userData = (await getUserSnapshot()).data()
				const projectToEdit = await appFirestore()
					.doc(getProfileDocument(userData.email))
					.collection(`projects`)
					.doc(query.edit)
					.get()

				setNewProject({ id: Number(projectToEdit.id), ...projectToEdit.data() } as IProject)
				setShowForm(true)
				setEditMode(true)
				query.edit = null
			}

			if (!!!query.edit) return
			getData()
		},
		[ query ]
	)

	const setupImgUpload = async (fileList: FileList) => {
		setPictureLoading(true)

		for (let intCtr = 0; intCtr < fileList.length; intCtr++) {
			if (fileList[intCtr]) {
				const file = new File(
					[ fileList[intCtr] as File ],
					(Date.now() * Math.floor(Math.random() * 10 + 1)).toString(),
					{ type: (fileList[intCtr] as File).type }
				)

				const imgRef = appStorage().ref().child(`users/${user.email}/project/${file.name}`)
				if (!file.type.includes('image')) {
					setErrors((prevState) => ({ ...prevState, projectImageFormat: true }))
					setPictureLoading(false)
				} else {
					setPictureLoading(true)
					await imgRef.put(file)
					const fileUrl = await imgRef.getDownloadURL()
					setNewProject((prevState) => ({
						...prevState,
						images: [ ...prevState.images, fileUrl ]
					}))
					setPictureLoading(false)
				}
			}
		}
	}

	const handleCheck = (name: string) => {
		setProjects((prevState) =>
			prevState.map((project) => {
				if (project.name !== name) {
					return project
				}
				return { ...project, checked: !project.checked }
			})
		)
	}

	const getProjectsChecked = () => {
		return filter(projects, (project) => project.checked)
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement

		setNewProject((prevState) => ({ ...prevState, [input.name]: input.value }))
	}

	const handleDeleteImg = (imgUrl: string) => {
		setNewProject((prevState) => ({
			...prevState,
			images: filter(prevState.images, (image) => image !== imgUrl)
		}))
	}

	const handleDelete = () => {
		setWizard((prevState) => ({
			...prevState,
			show: true,
			title: `Voulez-vous vraiment supprimer ${getProjectsChecked().length} projet${getProjectsChecked().length >
			1
				? 's'
				: ''}  ?`,
			message: 'Toutes les données associées seront supprimées et non récupérables.',
			confirm: deleteProjects
		}))
	}

	const deleteProjects = () => {
		const nbrDeleted = getProjectsChecked().length
		try {
			getProjectsChecked().forEach(async (project) => {
				appFirestore().doc(getProfileDocument(user.email)).collection(`projects`).doc(project.name).delete()
			})

			console.log('test')

			setShouldReload(Date.now())

			setConfirmation((prevState) => ({
				...prevState,
				show: true,
				message: `${nbrDeleted} projet${nbrDeleted > 1 ? 's' : ''} ${nbrDeleted > 1
					? 'ont'
					: 'a'} été supprimé${nbrDeleted > 1 ? 's' : ''}.`
			}))
		} catch (err) {}
	}

	const handleEdit = () => {
		setNewProject(find(projects, (project) => project.checked === true))
		setShowForm(true)
		setEditMode(true)
	}

	const verifyErrors = () => {
		let formContainsErrors = false

		if (newProject.images.length === 0) {
			formContainsErrors = true
			setErrors((prevState) => ({ ...prevState, projectNeedsImage: true }))
		} else {
			formContainsErrors = false
			setErrors((prevState) => ({ ...prevState, projectNeedsImage: false }))
		}

		if (!!!newProject.name) {
			formContainsErrors = true
			setErrors((prevState) => ({ ...prevState, projectNeedsName: true }))
		} else {
			if (formContainsErrors !== true) {
				formContainsErrors = false
			}
			setErrors((prevState) => ({ ...prevState, projectNeedsName: false }))
		}

		if (!!!newProject.description) {
			formContainsErrors = true
			setErrors((prevState) => ({ ...prevState, projectNeedsDescription: true }))
		} else {
			if (formContainsErrors !== true) {
				formContainsErrors = false
			}
			setErrors((prevState) => ({ ...prevState, projectNeedsDescription: false }))
		}

		return formContainsErrors
	}

	const handleSubmit = async () => {
		setLoading(true)

		if (!verifyErrors()) {
			if (editMode) {
				const set = await appFirestore()
					.doc(getProfileDocument(user.email))
					.collection(`projects`)
					.doc(newProject.id.toString())
					.update({
						id: newProject.id,
						name: newProject.name,
						description: newProject.description,
						images: newProject.images
					})

				setEditMode(false)

				setConfirmation((prevState) => ({
					...prevState,
					show: true,
					message: `La projet a été mise à jour.`
				}))

				setNewProject(getDefaultProject())
			} else {
				const set = await appFirestore()
					.doc(getProfileDocument(user.email))
					.collection(`projects`)
					.doc(Date.now().toString())
					.set({
						name: newProject.name,
						description: newProject.description,
						dateCreated: newProject.dateCreated.toString(),
						images: newProject.images
					})

				setConfirmation((prevState) => ({
					...prevState,
					show: true,
					message: `La projet a été ajouté.`
				}))
			}

			setShowForm(false)
			setShouldReload(Date.now())
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
				{loading || pictureLoading ? (
					<div className='dashboard__form__loading'>
						<Loader color='#000' size={50} />
					</div>
				) : null}

				<div className='dashboard__form__header pb-10'>
					{showForm ? (
						<Fragment>
							<h2>Projet</h2>
						</Fragment>
					) : (
						<Fragment>
							<h2 className='mb-15'>Mes projets</h2>
							<div className='actionBar'>
								<div className='actionBar__left'>
									<p>Identifiant</p>
									<p>Date d'ajout</p>
								</div>
								<div className='actionBar__right'>
									{getProjectsChecked().length === 1 ? (
										<p className='actionBar__right__btnWithIcon' onClick={handleEdit}>
											<img src='/icons/edit.svg' alt='' />Editer
										</p>
									) : null}

									{getProjectsChecked().length > 0 ? (
										<p className='actionBar__right__btnWithIcon' onClick={handleDelete}>
											<img src='/icons/trash--grey.svg' alt='' />
											Supprimer ({getProjectsChecked().length})
										</p>
									) : null}

									<Button className='actionBar__right__btnAdd' action={() => setShowForm(true)}>
										+ Ajouter
									</Button>
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
										label='Nom du projet'
										name='name'
										value={newProject.name}
										onChange={handleChange}
									/>
									{errors.projectNeedsName ? (
										<p className='error pl-25'>Vous devez entrer un nom pour ce projet.</p>
									) : null}

									<Input
										label='Description du projet'
										name='description'
										type='textarea'
										maxLength={500}
										value={newProject.description}
										onChange={handleChange}
									/>
									{errors.projectNeedsDescription ? (
										<p className='error pl-25'>Vous devez entrer une description pour ce projet.</p>
									) : null}
								</div>
								<div className='form__fields__right'>
									<div className='inputField pl-25 pr-25 pt-25'>
										<label htmlFor='projectImg'>Images du projet</label>
										<p>Nous vous conseillons de téléverser au moins 4 images.</p>
										<input
											name='projectImg'
											id='projectImg'
											type='file'
											multiple
											onChange={(e) =>
												setupImgUpload((e.currentTarget as HTMLInputElement).files as FileList)}
										/>

										<div className='projectImages'>
											{newProject.images.length ? (
												newProject.images.map((image, key) => {
													return (
														<div className='projectImages__image'>
															<span
																className='projectImages__image__deleteBtn'
																onClick={() => handleDeleteImg(image)}
															/>
															<img
																className='projectImages__image__img shadow'
																src={image}
																key={key}
															/>
														</div>
													)
												})
											) : null}
											<label htmlFor='projectImg' className='projectImg'>
												<div className='inputField__uploadZone'>
													<img src='/icons/uploadImage.svg' />
												</div>
											</label>
										</div>
										{errors.projectImageFormat ? (
											<p className='error'>Vous devez choisir un icône au format SVG.</p>
										) : null}

										{errors.projectNeedsImage && !errors.projectImageFormat ? (
											<p className='error'>
												Vous devez choisir au moins une image pour ce projet.
											</p>
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
										setNewProject(getDefaultProject())
									}}>
									Annuler
								</p>
							</div>
						</form>
					) : (
						<div className='itemsList'>
							{projects.length === 0 ? (
								<p className='pl-25 pr-15'>Il n'y a aucun projet à votre profil ! Ajoutez-en un.</p>
							) : (
								projects.map((project, key) => {
									return (
										<label htmlFor={project.name} className='itemsList__item' key={key}>
											<input
												name={project.name}
												id={project.name}
												type='checkbox'
												onChange={() => handleCheck(project.name)}
											/>
											<span
												className={`itemsList__item__checkbox${project.checked
													? ` itemsList__item__checkbox--checked`
													: ''}`}
											/>
											<div className='itemsList__item__data'>
												<p className='name'>{project.name}</p>
												<p className='date'>{moment(project.dateCreated).format('ll')}</p>
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
export default Projects
