import React from 'react'
import Main from '../layouts/Main'

const privacyPolicy = () => {
	return (
		<Main>
			<div className='container'>
				<h1>Politique de confidentialité.</h1>
				<p>Toutes les données receuillies seront entrées par l'utilisateur.</p>
				<p>Nous collectons les données suivantes: </p>
				<ol>
					<li>Nom</li>
					<li>Prénom</li>
					<li>Adresse</li>
					<li>Adresse courriel</li>
				</ol>

				<p>
					Aucune de ces données ne sera utilisée pour faire de l'argent, ou ne sera utilisée pour quelconque
					autre utilisation.
				</p>

				<p>Ceci est un projet scolaire réalisé par Samuel Loranger</p>

				<p>
					Pour toutes questions, communiquez avec moi{' '}
					<a href='mailto:samuelloranger@gmail.com'>par courriel</a>.
				</p>
			</div>
		</Main>
	)
}

export default privacyPolicy
