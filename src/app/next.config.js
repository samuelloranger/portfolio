const withSass = require('@zeit/next-sass')

module.exports = withSass({
	env: {
		FIRESTORE_KEY: 'AIzaSyAd8ZceCxCWtGT8frxXc9BVpeCKpUIpu6w'
	},
	distDir: '../../dist/functions/next'
})
