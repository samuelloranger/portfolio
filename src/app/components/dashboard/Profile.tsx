import React, { useEffect, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/router'

//Librairies
import { remove, find } from 'lodash'

//Context
import IUser, { getDefaultUser } from '../../constants/Interfaces/IUser'
import { getUserSnapshot } from '../../contexts/UserAuthContext/services'

//Components
import { Input, Loader, Button, PopUpConfirmation, Wizard } from '..'
import {
	appFirestore,
	appStorage,
	logout,
	appAuth,
	verifyUsername,
	firebaseApp,
	changeEmail
} from '../../services/firebase'
import { getProfileDocument } from '../../constants/firestorePath'

const Profile = () => {
	const router = useRouter()
	//UI Stuff
	const [ loading, setLoading ] = useState<boolean>(true)
	const [ locationLoading, setLocationLoading ] = useState<boolean>(false)
	const [ shouldReload, setShouldReload ] = useState<number>(0)
	const [ pictureLoading, setPictureLoading ] = useState<boolean>(false)

	//Error handling
	const [ errors, setErrors ] = useState({ tagContainSpace: false })
	const [ confirmation, setConfirmation ] = useState({ error: false, show: false, message: '' })
	const [ wizard, setWizard ] = useState({
		show: false,
		title: '',
		message: '',
		showTrashIcon: true,
		btnMessage: '',
		confirm: () => {}
	})
	const [ usernameValid, setUsernameValid ] = useState<boolean>(true)

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

	useEffect(() => {
		setLocationLoading(true)
		const setLocation = (location) => {
			fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords
					.longitude}&key=AIzaSyAd8ZceCxCWtGT8frxXc9BVpeCKpUIpu6w`
			)
				.then((data) => {
					return data.json()
				})
				.then((data) => {
					const address_components = data.results[0].address_components

					const city = find(address_components, (component) => component.types.includes('locality'))
					const region = find(address_components, (component) =>
						component.types.includes('administrative_area_level_1')
					)
					const country = find(address_components, (component) => component.types.includes('country'))

					setUser((prevState) => ({
						...prevState,
						location: `${city.long_name}, ${region.long_name}, ${country.long_name}`
					}))
					setLocationLoading(false)
				})
		}

		if (!!!user.location) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(setLocation)
			}
		}
	}, [])

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

	const handleBlurUsername = async (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.currentTarget as HTMLInputElement
		if (input.value !== (await getUserSnapshot()).data().username) {
			setUsernameValid(await verifyUsername(input.value))
		} else {
			console.log('egal')
		}
	}

	const handleSubmit = async () => {
		setLoading(true)

		const currentEmail = (await getUserSnapshot()).data().email

		if (user.email !== currentEmail) {
			setLoading(false)
			return setWizard({
				show: true,
				title: 'Vous avez changé votre courriel.',
				message: 'Puisque vous avez changé votre courriel, vous devrez vous reconnecter.',
				showTrashIcon: false,
				btnMessage: 'Changer mon courriel',
				confirm: () => handleChangeEmail(currentEmail)
			})
		} else {
			await appFirestore().doc(getProfileDocument(currentEmail)).update({ ...user })
		}

		setLoading(false)
		setConfirmation({ error: false, show: true, message: 'Modifications apportées' })
	}

	const handleChangeEmail = async (oldEmail: string) => {
		setLoading(true)
		// const collProjets = await appFirestore().collection('users').doc(oldEmail).collection('')

		// await appFirestore().collection('users').doc(oldEmail).delete()
		// await appFirestore().collection('users').doc(user.email).set({ ...user })
		// await firebaseApp().auth().currentUser.updateEmail(user.email)
		await changeEmail(user, oldEmail)

		setLoading(false)
		logout()
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
			showTrashIcon: true,
			btnMessage: 'Supprimer',
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
					showTrashIcon={wizard.showTrashIcon}
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
						<Input
							label='Mon nom d&#39;utilisateur'
							name='username'
							error={
								!usernameValid && <span className='error'>Ce nom d'utilisateur est déjà utilisé.</span>
							}
							value={user.username}
							onChange={handleChange}
							onBlur={handleBlurUsername}
						/>

						<Input label='Mon courriel' name='email' value={user.email} onChange={handleChange} />

						<Input label='Mon prénom' name='name' value={user.name} onChange={handleChange} />
						<Input label='Mon nom' name='family_name' value={user.family_name} onChange={handleChange} />
						<Input
							label='Ma description'
							name='description'
							type='textarea'
							maxLength={800}
							value={user.description}
							onChange={handleChange}
						/>

						<div className='locationInput'>
							<Input
								label='Mon emplacement'
								name='location'
								disabled={locationLoading}
								value={user.location}
								onChange={handleChange}
							/>
							{locationLoading && <Loader size={10} color='#1a73e8' />}
						</div>

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
