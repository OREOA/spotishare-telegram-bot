const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const axios = require('axios')

const bot = require('./bot')
const { getSession, openSession } = require('./utils/current-session')
const { setCookie } = require('./utils/cookie-store')

const API_URL = process.env.API_URL

const server = express()

server.use(morgan('dev'))
server.use(cookieParser())

server.get('/authenticate', (req, res) => {
    const chatId = req.query.id
    const cookie = req.cookies.spotishare
    if (!cookie) {
        return res.send('Something went wrong😢')
    }
    setCookie(chatId, cookie)
    bot.reply(parseInt(chatId)).text('Authenticated!')
    res.send('Authenticated!🚀 You can now close this page')

    // Fail silently if no session
    axios.get(`${API_URL}/api/session`, {
        headers: {
            Cookie: `spotishare=${cookie};`
        }
    })
        .then(({ data }) => {
            if (!getSession(chatId)) {
                openSession(chatId, data.hash)
            }
        })
        .catch(() => {})
})

module.exports = server
