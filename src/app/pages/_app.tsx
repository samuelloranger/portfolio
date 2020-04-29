import { AppProps } from 'next/app'
import '../styles/main.scss'
import moment from 'moment'
import UserAuthProvider from '../contexts/UserAuthContext/UserAuthProvider'

moment.locale('fr-CA')

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<UserAuthProvider>
			<Component {...pageProps} />
		</UserAuthProvider>
	)
}

export default MyApp
