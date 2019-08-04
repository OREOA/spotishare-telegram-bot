const botgram = require("botgram")
const { TELEGRAM_TOKEN } = require('./config')

const bot = botgram(TELEGRAM_TOKEN)

module.exports = bot
