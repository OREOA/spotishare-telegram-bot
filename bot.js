const TelegramBot = require('node-telegram-bot-api')

const TOKEN = '954260187:AAEHEH2W0NPd7DMczCA8qmjcn-y5LM-pgA8'
// const token = process.env.TOKEN

const bot = new TelegramBot(TOKEN, { polling: true })

module.exports = bot
