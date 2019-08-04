const { getCookie } = require('./cookie-store')

const getOptions = module.exports = (chatId, extraOptions = {}) => {
    return {
        headers: {
            Cookie: `spotishare=${getCookie(chatId)};`,
        },
        ...extraOptions,
    }
}
