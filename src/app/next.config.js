const withSass = require('@zeit/next-sass')
const webpack = require('webpack')

module.exports = withSass({
	env: {
		FIRESTORE_KEY: 'AIzaSyAd8ZceCxCWtGT8frxXc9BVpeCKpUIpu6w'
	},
	plugins: [
		// load `moment/locale/ja.js` and `moment/locale/it.js`
		new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /fr/)
	],
	distDir: '../../dist/functions/next'
})
