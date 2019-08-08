const { openSession, removeSession } = require('../utils/current-session')
const axios = require('../utils/axios')
const getOptions = require('../utils/getOptions')
const { API_URL } = require('../config')
const InfoError = require('../utils/InfoError')

const getMe = exports.getMe = (chatId) => axios(chatId)({
    url:`${API_URL}/api/me`
})

const createSession = exports.createSession = (chatId) => {
    return axios(chatId)({
        method: 'POST',
        url: `${API_URL}/api/session`
    })
        .then(({ data: { hash } }) => {
            openSession(chatId, hash)
            return hash
        })
}

const getMySession = exports.getMySession = (chatId) => {
    return axios(chatId)({
        url: `${API_URL}/api/session`
    })
        .then(({ data }) => {
            if (!data) {
                throw new InfoError('You have no active session, you can create one by typing /createsession')
            }
            return data.hash
        })
}

const endMySession = exports.endMySession = (chatId) => {
    removeSession(chatId)
    return axios(chatId)({
        method: 'DELETE',
        url: `${API_URL}/api/session`,
    })
        .then(({ data }) => {
            if (data == null) {
                throw new Error('You have no active session')
            }
            return axios.get(`${API_URL}/api/session/${data.hash}`, getOptions(chatId))
        })
}
