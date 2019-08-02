const dotenv = require('dotenv')
dotenv.config()

const server = require('./server')
const bot = require('./bot')
const { getCookie } = require('./utils/cookie-store')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { openSession, removeSession, getSession } = require('./utils/current-session')

const authenticatedOnly = require('./utils/authenticatedOnly')
const { formatSong, formatSongList } = require('./utils/format')


const API_URL = process.env.API_URL
const BASE_URL = process.env.BASE_URL

const errorHandler = (chatId, error) => {
    bot.sendMessage(chatId, error.response && error.response.data || `Error happened! Message: ${error.message}`)
}

const getOptions = (chatId, extraOptions = {}) => {
    return {
        headers: {
            Cookie: `spotishare=${getCookie(chatId)};`,
        },
        ...extraOptions
    }
}

const helpText = fs.readFileSync(path.resolve(__dirname, 'help.txt'), 'utf8')

bot.onText(/\/start( (.+))?/, (msg, match) => {
    const chatId = msg.chat.id
    // const hash = match[2]
    bot.sendMessage(chatId, helpText)
})

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, helpText)
})

bot.onText(/\/login/, (msg) => {
    const chatId = msg.chat.id
    const redirectUri = encodeURIComponent(`${BASE_URL}/authenticate?id=${chatId}`)
    const url = `${API_URL}/login?redirectUrl=${redirectUri}`
    bot.sendMessage(chatId, `Please open ${url} to authenticate`)
})

bot.onText(/\/me/, authenticatedOnly((msg) => {
    const chatId = msg.chat.id
    axios.get(`${API_URL}/api/me`, getOptions(chatId))
        .then(({ data }) => {
            bot.sendMessage(chatId, `Logged in as ${data.display_name} (${data.id})\n${data.external_urls.spotify}`)
        })
        .catch((error) => {
            errorHandler(chatId, error)
        })
}))

bot.onText(/\/createsession/, authenticatedOnly((msg) => {
    const chatId = msg.chat.id
    axios.post(`${API_URL}/api/session`, {}, getOptions(chatId))
        .then(({ data: { hash } }) => {
            openSession(chatId, hash)
            bot.sendMessage(chatId, `Session created, hash: ${hash}`)
        })
        .catch((error) => {
            errorHandler(chatId, error)
        })
}))

bot.onText(/\/mysession/, authenticatedOnly((msg) => {
    const chatId = msg.chat.id
    axios.get(`${API_URL}/api/session`, getOptions(chatId))
        .then(({ data }) => {
            if (data == null) {
                return bot.sendMessage(chatId, 'You have no active session, you can create one by typing /createsession')
            }
            bot.sendMessage(chatId, `Session hash: ${data.hash}`)
        })
        .catch((error) => {
            errorHandler(chatId, error)
        })
}))

bot.onText(/\/session/, authenticatedOnly((msg) => {
    const chatId = msg.chat.id
    const sessionHash = getSession(chatId)
    if (!sessionHash) {
        return bot.sendMessage(chatId, 'You have no active session, you can create one by typing /createsession')
    }
    // TODO: show session owner
    return bot.sendMessage(chatId, `Session hash: ${sessionHash}`)
}))

bot.onText(/\/opensession (.+)/, authenticatedOnly((msg, match) => {
    const chatId = msg.chat.id
    const hash = match[1]
    openSession(chatId, hash)
    bot.sendMessage(chatId, `Opened session ${hash}`)
}))

bot.onText(/\/endsession/, authenticatedOnly((msg) => {
    const chatId = msg.chat.id
    removeSession(chatId)
    axios.delete(`${API_URL}/api/session`, getOptions(chatId))
        .then(({ data }) => {
            if (data == null) {
                return bot.sendMessage(chatId, 'You have no active session')
            }
            return axios.get(`${API_URL}/api/session/${data.hash}`, getOptions(chatId))
        })
        .then(() => {
            bot.sendMessage(chatId, 'Your session has been ended')
        })
        .catch((error) => {
            errorHandler(chatId, error)
        })
}))

bot.onText(/\/queue/, authenticatedOnly((msg) => {
    const chatId = msg.chat.id
    const sessionHash = getSession(chatId)
    if (!sessionHash) {
        return bot.sendMessage(chatId, 'You have to open or create a session first')
    }
    axios.get(`${API_URL}/api/song`, getOptions(chatId, {
        params: {
            session: sessionHash,
        },
    }))
        .then(({ data: { queue } }) => {
            bot.sendMessage(chatId, `${queue.length} songs in queue:\n${formatSongList(queue, { prefix: '\t' })}`)
        })
        .catch((error) => {
            errorHandler(chatId, error)
        })
}))

bot.onText(/\/current/, authenticatedOnly((msg) => {
    const chatId = msg.chat.id
    const sessionHash = getSession(chatId)
    if (!sessionHash) {
        return bot.sendMessage(chatId, 'You have to open or create a session first')
    }
    axios.get(`${API_URL}/api/song`, getOptions(chatId, {
        params: {
            session: sessionHash,
        },
    }))
        .then(({ data: { song } }) => {
            return bot.sendMessage(chatId, formatSong(song) || 'Nothing is playing right now')
        })
        .catch((error) => {
            errorHandler(chatId, error)
        })
}))

bot.onText(/\/addsong( (.+))?/, authenticatedOnly((msg, match) => {
    const chatId = msg.chat.id
    const sessionHash = getSession(chatId)
    if (!sessionHash) {
        return bot.sendMessage(chatId, 'You have to open or create a session first')
    }
    if (!match || !match[2]) {
        return bot.sendMessage(chatId, 'You need to give song url/id')
    }
    const songUrl = match[2]
    const spotifyMatch = songUrl.match(/^(https:\/\/open.spotify.com\/track\/|spotify:track:)?([a-zA-Z0-9]+)(.*)$/)
    if (!spotifyMatch || !spotifyMatch[2]) {
        return bot.sendMessage(chatId, 'Id couldn\'t be parsed')
    }
    const songId = spotifyMatch[2]
    axios.post(`${API_URL}/api/song`, {
        songId,
        session: sessionHash
    }, getOptions(chatId))
        .then(() => {
            return bot.sendMessage(chatId, 'Song added!')
        })
        .catch((error) => {
            errorHandler(chatId, error)
        })
}))

bot.onText(/\/logout/, authenticatedOnly((msg) => {
    const chatId = msg.chat.id
    removeSession(chatId)
    bot.sendMessage(chatId, 'You have been logged out')
}))

const port = process.env.PORT || 3600
server.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`)
    /* eslint-enable no-console */
})
