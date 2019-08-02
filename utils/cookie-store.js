
const cookieStore = {}

exports.setCookie = (chatId, cookie) => {
    cookieStore[chatId] = cookie
}

exports.getCookie = (chatId) => {
    return cookieStore[chatId]
}