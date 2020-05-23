import React, { useState } from 'react'
import IProject from '../constants/Interfaces/IProject'

interface IProps {
	readonly images: IProject['images']
}

const Slider = ({ images }: IProps) => {
	const [ currentImg, setCurrentImg ] = useState<number>(0)

	return (
		<div className='slider'>
			<div className='slider__current'>
				{/* <img className='img' src={images[currentImg]} alt='' /> */}

				{images.map((img, key) => {
					return (
						<img
							src={img}
							className={`img${key < currentImg
								? ' img--inactive'
								: key > currentImg ? ' img--hidden' : ''}`}
							alt=''
							key={key}
							onClick={() => setCurrentImg(key)}
						/>
					)
				})}
			</div>

			<div
				className={`slider__gallery${images.length > 3 && currentImg > 2
					? ' slider__gallery--overflowFix'
					: ''}`}>
				{images.map((img, key) => {
					return (
						<img
							src={img}
							className={`slider__gallery__image${key === currentImg
								? ' slider__gallery__image--current'
								: ''}`}
							alt=''
							key={key}
							onClick={() => setCurrentImg(key)}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default Slider
