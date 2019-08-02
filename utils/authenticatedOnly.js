const { getCookie } = require('./cookie-store')
const bot = require('../bot')

const authenticatedOnly = (func) => (msg, match) => {
    const chatId = msg.chat.id
    if (getCookie(chatId)) {
        func(msg, match)
    } else {
        bot.sendMessage(chatId, 'In order to use me you need to log in with Spotify by typing /login')
    }
}

module.exports = authenticatedOnly
