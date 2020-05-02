import React, { useEffect, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/router'

//Librairies
import { remove, find } from 'lodash'

//Context
import IUser, { getDefaultUser } from '../../constants/Interfaces/IUser'
import { getUserSnapshot } from '../../contexts/UserAuthContext/services'

//Components
import { Input, Loader, Button, PopUpConfirmation, Wizard } from '..'
import { appFirestore, appStorage, logout, firebaseApp, appAuth } from '../../services/firebase'
import { getProfileDocument } from '../../constants/firestorePath'

const Profile = () => {
	const router = useRouter()
	//UI Stuff
	const [ loading, setLoading ] = useState<boolean>(true)
	const [ shouldReload, setShouldReload ] = useState<number>(0)
	const [ pictureLoading, setPictureLoading ] = useState<boolean>(false)

	//Error handling
	const [ errors, setErrors ] = useState({ tagContainSpace: false })
	const [ confirmation, setConfirmation ] = useState({ error: false, show: false, message: '' })
	const [ wizard, setWizard ] = useState({ show: false, title: '', message: '', confirm: () => {} })

	//User data
	const [ user, setUser ] = useState<IUser>(getDefaultUser())
	const [ userPicture, setUserPicture ] = useState<string>('')
	const [ tags, setTags ] = useState<string[]>([])
	const [ newTag, setNewTag ] = useState<string>('')

	useEffect(
		() => {
			const getData = async () => {
				const userData = (await getUserSnapshot()).data()
				if (!!!userData) {
					setShouldReload(Date.now())
					return
				}
				setUser(userData)

				console.log(user)
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
						setPictureLoading(false)
						break
					case 'none':
						setUserPicture('/img/userProfileImg.png')
						break
				}

				const tagsRefs = await appFirestore().collection('users').doc(userData.email).collection('tags').get()
				setTags(
					tagsRefs.docs.map((tag) => {
						return tag.data().tag
					})
				)
				setLoading(false)
			}

			getData()
		},
		[ user.picture, user.c_picture, shouldReload ]
	)

	useEffect(
		() => {
			setErrors((prevState) => ({ ...prevState, tagContainSpace: newTag.includes(' ') }))
		},
		[ newTag ]
	)

	const uploadFile = async (fileList: FileList) => {
		if (fileList[0]) {
			setPictureLoading(true)
			const file = new File([ fileList[0] as File ], user.email, { type: (fileList[0] as File).type })

			const imgRef = appStorage().ref().child(`users/${file.name}`)

			const upload = imgRef.put(file)

			upload.on('state_changed', async () => {
				const fileUrl = await upload.snapshot.ref.getDownloadURL()
				setUser((prevState) => ({
					...prevState,
					picture: 'custom',
					c_picture: `users/${file.name}`
				}))
				setShouldReload(Date.now())
				setUserPicture(fileUrl)
			})
		}
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement

		setUser((prevState) => ({
			...prevState,
			[input.name]: input.value
		}))
	}

	const handleChangeTag = (e: ChangeEvent) => {
		const input = e.currentTarget as HTMLInputElement
		setNewTag(input.value)
	}

	const handleAddTag = async (e: any = null) => {
		if (e !== null) e.preventDefault()
		if (errors.tagContainSpace) return
		if (newTag === '') return
		if (find(tags, (item) => item === newTag)) return
		await appFirestore().doc(getProfileDocument(user.email)).collection(`tags`).doc(newTag).set({ tag: newTag })
		setTags((prevState) => [ ...prevState, newTag ])
		setNewTag('')
	}

	const handleRemoveTag = async (tagToRemove: string) => {
		await appFirestore().doc(getProfileDocument(user.email)).collection(`tags`).doc(tagToRemove).delete()
		if (tags.length === 1) {
			setTags([])
			return
		}

		setTags(remove(tags, (item) => item !== tagToRemove))
	}

	const handleSubmit = async () => {
		setLoading(true)
		await appFirestore().doc(getProfileDocument(user.email)).update({ ...user })

		setLoading(false)
		setConfirmation({ error: false, show: true, message: 'Modifications apportées' })
	}

	const submitNewPictureMode = async (type: string) => {
		setLoading(true)
		await appFirestore().doc(getProfileDocument(user.email)).update({ ...user, picture: type })
		setShouldReload(Date.now())
	}

	const handleDeleteAccount = () => {
		setWizard({
			show: true,
			title: 'Voulez-vous vraiment supprimer votre compte?',
			message: 'Toutes vos données associées, ainsi que vos projets seront supprimées et non récupérables.',
			confirm: deleteAccount
		})
	}

	const deleteAccount = async () => {
		setLoading(true)
		await appFirestore().doc(getProfileDocument(user.email)).delete()
		await appAuth().currentUser.delete()
		await logout()
		router.push('/')
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

			<div className='dashboard__form shadow mr-25 pb-15'>
				{loading ? (
					<div className='dashboard__form__loading'>
						<Loader color='#000' size={50} />
					</div>
				) : null}

				<div className='dashboard__form__header'>
					<h2>Mon profil</h2>
				</div>

				<div className='dashboard__form__content'>
					<div className='left'>
						<Input label='Mon prénom' name='name' value={user.name} onChange={handleChange} />
						<Input label='Mon nom' name='family_name' value={user.family_name} onChange={handleChange} />
						<Input
							label='Ma description'
							name='description'
							type='textarea'
							maxLength={500}
							value={user.description}
							onChange={handleChange}
						/>
						<Input label='Mon poste' name='poste' value={user.poste} onChange={handleChange} />
						<Input label='Mon employeur' name='employeur' value={user.employeur} onChange={handleChange} />
					</div>
					<div className='right'>
						<div className='right__uploadPhoto pl-25 pr-25 pt-25'>
							<label htmlFor='uploadPhoto'>Ma photo de profil</label>

							<label className='right__photoProfil' htmlFor='uploadPhoto'>
								<input
									name='uploadPhoto'
									id='uploadPhoto'
									className='right__photoProfil__uploadPhoto'
									type='file'
									onChange={(e) =>
										uploadFile((e.currentTarget as HTMLInputElement).files as FileList)}
								/>
								<div className='right__photoProfil__image'>
									{pictureLoading ? (
										<span className='loader'>
											<Loader size={50} color='#fff' />
										</span>
									) : null}
									<span className='modifier'>Modifier</span>
									<img className='img mt-10' src={userPicture} alt='' />
								</div>
							</label>
							{user.g_picture && user.picture !== 'google' ? (
								<p className='a' onClick={() => submitNewPictureMode('google')}>
									Utiliser la photo de mon compte Google
								</p>
							) : null}
							{user.f_picture && user.picture !== 'facebook' ? (
								<p className='a' onClick={() => submitNewPictureMode('facebook')}>
									Utiliser la photo de mon compte Facebook
								</p>
							) : null}
						</div>

						<div className='right__tags mt-15'>
							<form className='right__tags__form pl-25' onSubmit={handleAddTag}>
								{errors.tagContainSpace ? (
									<span className='error'>Le tag ne peut pas contenir d'espace.</span>
								) : null}
								<Input
									label='Ajouter des tags'
									name='tag'
									pattern='^[a-zA-Z0-9]*$'
									className='pt-0'
									value={newTag}
									onChange={handleChangeTag}
								/>
								<Button className='mt-15' action={handleAddTag}>
									+ Ajouter
								</Button>
							</form>

							<div className='right__tags__list pl-25 pt-30'>
								{tags.map((tag, key) => {
									return (
										<span key={key} onClick={() => handleRemoveTag(tag)}>
											#{tag}
										</span>
									)
								})}
							</div>
						</div>
					</div>
				</div>

				<div className='dashboard__form__submit'>
					<Button className='m-25' action={handleSubmit}>
						Enregistrer les modifications
					</Button>

					<span className='deleteBtn' onClick={handleDeleteAccount}>
						<img src='/icons/trash--red.svg' alt='' /> Supprimer mon compte
					</span>
				</div>
			</div>
		</div>
	)
}

export default Profile
