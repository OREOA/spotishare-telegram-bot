const { openSession, removeSession } = require('../utils/current-session')
const axios = require('axios')
const getOptions = require('../utils/getOptions')
const { API_URL } = require('../config')

const getMe = exports.getMe = (chatId) => axios.get(`${API_URL}/api/me`, getOptions(chatId))

const createSession = exports.createSession = (chatId) => {
    return axios.post(`${API_URL}/api/session`, {}, getOptions(chatId))
        .then(({ data: { hash } }) => {
            openSession(chatId, hash)
            return hash
        })
}

const getMySession = exports.getMySession = (chatId) => {
    return axios.get(`${API_URL}/api/session`, getOptions(chatId))
        .then(({ data }) => {
            if (data == null) {
                throw new Error('You have no active session, you can create one by typing /createsession')
            }
            return data.hash
        })
}

const endMySession = exports.endMySession = (chatId) => {
    removeSession(chatId)
    return axios.delete(`${API_URL}/api/session`, getOptions(chatId))
        .then(({ data }) => {
            if (data == null) {
                throw new Error('You have no active session')
            }
            return axios.get(`${API_URL}/api/session/${data.hash}`, getOptions(chatId))
        })
}
