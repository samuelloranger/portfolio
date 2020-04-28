import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
	static async getInitialProps(ctx: any) {
		const initialProps = await Document.getInitialProps(ctx)
		return { ...initialProps }
	}

	render() {
		return (
			<Html>
				<Head>
					{/* <link rel='apple-touch-icon' sizes='57x57' href='/apple-icon-57x57.png' />
					<link rel='apple-touch-icon' sizes='60x60' href='/apple-icon-60x60.png' />
					<link rel='apple-touch-icon' sizes='72x72' href='/apple-icon-72x72.png' />
					<link rel='apple-touch-icon' sizes='76x76' href='/apple-icon-76x76.png' />
					<link rel='apple-touch-icon' sizes='114x114' href='/apple-icon-114x114.png' />
					<link rel='apple-touch-icon' sizes='120x120' href='/apple-icon-120x120.png' />
					<link rel='apple-touch-icon' sizes='144x144' href='/apple-icon-144x144.png' />
					<link rel='apple-touch-icon' sizes='152x152' href='/apple-icon-152x152.png' />
					<link rel='apple-touch-icon' sizes='180x180' href='/apple-icon-180x180.png' />
					<link rel='icon' type='image/png' sizes='192x192' href='/android-icon-192x192.png' />
					<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
					<link rel='icon' type='image/png' sizes='96x96' href='/favicon-96x96.png' />
					<link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
					<link rel='manifest' href='/manifest.json' />
					<meta name='msapplication-TileColor' content='#ffffff' />
					<meta name='msapplication-TileImage' content='/ms-icon-144x144.png' />
					<meta name='theme-color' content='#ffffff' />
					<meta property='og:url' content='https://homevideo19.com' />
					<meta property='og:type' content='website' />
					<meta property='og:title' content='Homevideo19 | Partagez votre confinement!' />
					<meta
						property='og:description'
						content='Découvrez ce que font les gens durant le confinement partout à travers le monde grâce à de courtes vidéos.'
					/>
					<meta property='og:image' content='/Homevideo19.png' />
					<meta property='og:locale' content='en_US' />
					<meta property='og:locale:alternate' content='fr_CA' />
					<meta property='og:image:type' content='image/jpeg' />
					<meta property='og:image:width' content='1200' />
					<meta property='og:image:height' content='630' /> */}
				</Head>
				<body>
					{/* <noscript>
						<iframe
							src='https://www.googletagmanager.com/ns.html?id=GTM-KJ5FHKR'
							height='0'
							width='0'
							style={{ display: 'none', visibility: 'hidden' }}
						/>
					</noscript> */}

					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default MyDocument
