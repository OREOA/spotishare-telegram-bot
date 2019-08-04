const axios = require('axios')
const errorHandler = require('../utils/errorHandler')
const getOptions = require('../utils/getOptions')
const { API_URL } = require('../config')

const getQueue = exports.getQueue = (chatId, sessionHash) => {
    return axios.get(`${API_URL}/api/song`, getOptions(chatId, {
        params: {
            session: sessionHash,
        },
    }))
        .then(({ data: { queue } }) => queue)
        .catch((error) => {
            errorHandler(chatId, error)
        })
}

const getCurrent = exports.getCurrent = (chatId, sessionHash) => {
    return axios.get(`${API_URL}/api/song`, getOptions(chatId, {
        params: {
            session: sessionHash,
        },
    }))
        .then(({ data: { song } }) => song)
}

const addSong = exports.addSong = (chatId, sessionHash, songId) => {
    return axios.post(`${API_URL}/api/song`, {
        songId,
        session: sessionHash,
    }, getOptions(chatId))
}