const { Wit, log } = require('node-wit')
const { WIT_TOKEN } = require('./config')

const witClient = new Wit({
    accessToken: WIT_TOKEN,
    logger: new log.Logger(process.env.DEBUG ? log.DEBUG : log.ERROR), // optional
})

module.exports = witClient