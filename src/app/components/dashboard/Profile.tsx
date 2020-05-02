import React, { useEffect, useState, ChangeEvent } from 'react'

//Context
import IUser, { getDefaultUser } from '../../constants/Interfaces/IUser'
import { getUserSnapshot } from '../../contexts/UserAuthContext/services'

//Components
import { Input, Loader, Button } from '..'
import { appFirestore, appStorage } from '../../services/firebase'
import { getProfileDocument } from '../../constants/firestorePath'

const Profile = () => {
	const [ loading, setLoading ] = useState<boolean>(true)
	const [ pictureLoading, setPictureLoading ] = useState<boolean>(false)
	const [ user, setUser ] = useState<IUser>(getDefaultUser())
	const [ userPicture, setUserPicture ] = useState<string>('')
	const [ shouldReload, setShouldReload ] = useState<number>(0)

	useEffect(
		() => {
			const getData = async () => {
				const userData = (await getUserSnapshot()).data()
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

				setLoading(false)
			}

			getData()
		},
		[ user.picture, user.c_picture, shouldReload ]
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

	const handleChange = (e: ChangeEvent) => {
		const input = e.currentTarget as HTMLInputElement

		setUser((prevState) => ({
			...prevState,
			[input.name]: input.value
		}))
	}

	const handleSubmit = async () => {
		setLoading(true)
		await appFirestore().doc(getProfileDocument(user.email)).update({ ...user })
		setLoading(false)
	}

	return (
		<div className='pt-20'>
			<form className='dashboard__form shadow mr-25 pb-15'>
				{loading ? (
					<div className='dashboard__form__loading'>
						<Loader color='#000' size={50} />
					</div>
				) : null}

				<div className='dashboard__form__header'>
					<h2>Mon profil</h2>
				</div>

				<div className='dashboard__form__content'>
					<div className='right'>
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
					<div className='left'>
						<div className='inputField pl-25 pr-25 pt-25'>
							<label htmlFor='uploadPhoto'>Ma photo de profil</label>

							<label className='left__photoProfil' htmlFor='uploadPhoto'>
								<input
									name='uploadPhoto'
									id='uploadPhoto'
									className='left__photoProfil__uploadPhoto'
									type='file'
									onChange={(e) =>
										uploadFile((e.currentTarget as HTMLInputElement).files as FileList)}
								/>
								<div className='left__photoProfil__image'>
									{pictureLoading ? (
										<span className='loader'>
											<Loader size={50} color='#fff' />
										</span>
									) : null}
									<span className='modifier'>Modifier</span>
									<img className='img mt-10' src={userPicture} alt='' />
								</div>
							</label>
						</div>
					</div>
				</div>

				<Button className='m-25' action={handleSubmit}>
					Enregistrer les modifications
				</Button>
			</form>
		</div>
	)
}

export default Profile
