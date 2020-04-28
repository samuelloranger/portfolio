const withSass = require('@zeit/next-sass')

module.exports = withSass({
	env: {},
	distDir: '../../dist/functions/next'
})
