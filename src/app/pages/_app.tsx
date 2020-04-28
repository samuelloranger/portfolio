import { AppProps } from 'next/app'
import '../styles/main.scss'
import moment from 'moment'

moment.locale('fr-CA')

function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />
}

export default MyApp
