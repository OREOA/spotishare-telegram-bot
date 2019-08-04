const { getSession } = require('./current-session')
const authenticatedOnly = require('./authenticatedOnly')

const bot = require('../bot')

const withSessionOnly = (func) => authenticatedOnly((msg, match) => {
    const chatId = msg.chat.id
    const sessionHash = getSession(chatId)
    if (!sessionHash) {
        return reply.text('You have to open or create a session first')
    }
    msg.sessionHash = sessionHash
    return func(msg, match)
})

module.exports = withSessionOnly
