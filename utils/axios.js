const axios = require('axios')
const { getCookie, setCookie } = require('./cookie-store')
const { getSession } = require('./current-session')

const axiosCreator = (chatId) => (config) => {
    const cookie = getCookie(chatId)
    const session = getSession(chatId)
    const headersWithCookie = {
        Cookie: `spotishare=${cookie};${config.headers && config.headers.Cookie || ''}`
    }
    const dataWithSession = {
        session
    }
    const { params = {}, headers = {}, method = 'GET', data = {} } = config
    const useParams = method.toLowerCase() === 'get' || method.toLowerCase() === 'delete'
    return axios({
        ...(config || {}),
        headers: {
            ...headers,
            ...headersWithCookie
        },
        params: {
            ...params,
            ...(useParams ? dataWithSession : {}),
        },
        data: {
            ...data,
            ...(!useParams ? dataWithSession : {}),
        }
    })
        .then((res) => {
            const { headers } = res
            if (headers['set-cookie'] && headers['set-cookie'].find((h) => h.startsWith('spotishare'))) {
                const cookie = headers['set-cookie'].find((h) => h.startsWith('spotishare')).split('spotishare=')[1]
                setCookie(chatId, cookie)
            }
            return res
        })
}

module.exports = axiosCreator