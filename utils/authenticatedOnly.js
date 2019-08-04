const { getCookie } = require('./cookie-store')

const authenticatedOnly = (func) => (msg, reply) => {
    const chatId = msg.chat.id
    if (getCookie(chatId)) {
        func(msg, reply)
    } else {
        reply.text('In order to use me you need to log in with Spotify by typing /login')
    }
}

module.exports = authenticatedOnly
