const { getSession } = require('./current-session')
const authenticatedOnly = require('./authenticatedOnly')

const withSessionOnly = (func) => authenticatedOnly((msg, reply) => {
    const chatId = msg.chat.id
    const sessionHash = getSession(chatId)
    if (!sessionHash) {
        return reply.text('You have to open or create a session first')
    }
    msg.sessionHash = sessionHash
    return func(msg, reply)
})

module.exports = withSessionOnly
