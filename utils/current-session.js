
const sessions = {}

exports.openSession = (chatId, sessionId) => {
    sessions[chatId] = sessionId
}

exports.getSession = (chatId) => {
    return sessions[chatId]
}

exports.removeSession = (chatId) => {
    delete sessions[chatId]
}