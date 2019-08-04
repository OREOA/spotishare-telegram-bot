const axios = require('axios')
const getOptions = require('../utils/getOptions')
const { API_URL } = require('../config')

const searchTrack = exports.searchTrack = (chatId, sessionHash, text) => {
    return axios.get(`${API_URL}/api/search`, getOptions(chatId, {
        params: {
            searchQuery: text,
            session: sessionHash,
        },
    }))
        .then(({ data: { body: { tracks } } }) => tracks)
}
