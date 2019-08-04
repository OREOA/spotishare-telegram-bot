const dotenv = require('dotenv')
dotenv.config()

const { API_URL, BASE_URL, ENABLE_FREE_TEXT, FREE_TEXT_IN_PRIVATE_ONLY } = require('./config')

const server = require('./server')
const bot = require('./bot')
const { getCookie } = require('./utils/cookie-store')
const fs = require('fs')
const path = require('path')
const { openSession, removeSession, getSession } = require('./utils/current-session')

let witClient
if (ENABLE_FREE_TEXT) {
    witClient = require('./witClient')
}

const { endMySession } = require('./services/session')
const authenticatedOnly = require('./utils/authenticatedOnly')
const withSessionOnly = require('./utils/withSessionOnly')
const { formatSong, formatSongList } = require('./utils/format')
const errorHandler = require('./utils/errorHandler')
const { createSession, getMe, getMySession } = require('./services/session')
const { addSong, getCurrent, getQueue } = require('./services/song')
const { searchTrack } = require('./services/search')

const helpText = fs.readFileSync(path.resolve(__dirname, 'help.txt'), 'utf8')

bot.command('start', 'help', (msg, reply) => {
    reply.text(helpText)
})

bot.command('login', (msg, reply) => {
    const chatId = msg.chat.id
    const redirectUri = encodeURIComponent(`${BASE_URL}/authenticate?id=${chatId}`)
    const url = `${API_URL}/login?redirectUrl=${redirectUri}`
    reply.text(`Please open ${url} to authenticate`)
})

bot.command('me', authenticatedOnly((msg, reply) => {
    const chatId = msg.chat.id
    getMe(chatId)
        .then(({ data }) => {
            reply.text(`Logged in as ${data.display_name} (${data.id})\n${data.external_urls.spotify}`)
        })
        .catch(errorHandler.bind(null, reply))
}))

bot.command('createsession', authenticatedOnly((msg, reply) => {
    const chatId = msg.chat.id
    createSession(chatId)
        .then((hash) => {
            reply.text(`Session created, hash: ${hash}`)
        })
        .catch(errorHandler.bind(null, reply))
}))

bot.command('mysession', authenticatedOnly((msg, reply) => {
    const chatId = msg.chat.id
    getMySession(chatId)
        .then((hash) => {
            reply.text(`Session hash: ${hash}`)
        })
        .catch(errorHandler.bind(null, reply))
}))

bot.command('session', authenticatedOnly((msg, reply) => {
    const sessionHash = getSession(msg.chat.id)
    if (!sessionHash) {
        return reply.text('You have no active session, you can create one by typing /createsession')
    }
    // TODO: show session owner
    return reply.text(`Session hash: ${sessionHash}`)
}))

bot.command('opensession', authenticatedOnly((msg, reply) => {
    const chatId = msg.chat.id
    const [ hash ] = msg.args[2]
    openSession(chatId, hash)
    reply.text(`Opened session ${hash}`)
}))

bot.command('endsession', authenticatedOnly((msg, reply) => {
    const chatId = msg.chat.id
    endMySession(chatId
        .then(() => {
            reply.text('Your session has been ended')
        }))
}))

bot.command('queue', withSessionOnly((msg, reply) => {
    const chatId = msg.chat.id
    const { sessionHash } = msg
    getQueue(chatId, sessionHash)
        .then((queue) => {
            reply.text(`${queue.length} songs in queue:\n${formatSongList(queue, { prefix: '\t' })}`)
        })
        .catch(errorHandler.bind(null, reply))
}))

bot.command('current', withSessionOnly((msg, reply) => {
    const chatId = msg.chat.id
    const { sessionHash } = msg
    getCurrent(chatId, sessionHash)
        .then((song) => {
            return reply.text(formatSong(song) || 'Nothing is playing right now')
        })
        .catch(errorHandler.bind(null, reply))
}))

bot.command('addsong', withSessionOnly((msg, reply) => {
    const chatId = msg.chat.id
    const { sessionHash } = msg
    const [ songUrl ] = msg.args[2]
    if (!songUrl) {
        return reply.text('You need to give song url/id')
    }
    const spotifyMatch = songUrl.match(/^(https:\/\/open.spotify.com\/track\/|spotify:track:)?([a-zA-Z0-9]+)(.*)$/)
    if (!spotifyMatch || !spotifyMatch[2]) {
        return reply.text('Id couldn\'t be parsed')
    }
    const songId = spotifyMatch[2]
    addSong(chatId, sessionHash, songId)
        .then(() => {
            return reply.text('Song added!')
        })
        .catch(errorHandler.bind(null, reply))
}))

bot.command('logout', authenticatedOnly((msg, reply) => {
    const chatId = msg.chat.id
    removeSession(chatId)
    reply.text('You have been logged out')
}))

if (ENABLE_FREE_TEXT && witClient) {
    bot.message((msg, reply) => {
        if (FREE_TEXT_IN_PRIVATE_ONLY && msg.chat.type !== 'private') {
            return
        }
        const chatId = msg.chat.id
        const cookie = getCookie(chatId)
        if (!cookie) {
            return
        }
        const sessionHash = getSession(chatId)
        if (!sessionHash) {
            return
        }
        if (msg.text.startsWith('/')) {
            return
        }
        witClient.message(msg.text)
            .then(({ entities }) => {
                if (!Object.keys(entities).length) {
                    return
                }
                const intent = entities.intent && entities.intent[0]
                if (!intent && intent.confidence < 0.8) {
                    return
                }
                switch (intent.value) {
                    case 'add':
                        const artist = entities.artist && entities.artist[0].value
                        const song = entities.song && entities.song[0].value
                        if (!song) {
                            return
                        }
                        return searchTrack(chatId, sessionHash, artist ? artist + ' ' : '' + song)
                            .then((tracks) => {
                                const song = tracks.items[0]
                                if (!song) {
                                    return reply.text('Couldn\'t find any tracks')
                                }
                                return addSong(chatId, sessionHash, song.id)
                                    .then(() => {
                                        reply.text(`${song.name} by ${song.artists[0].name} added`)
                                    })
                            })
                            .catch(errorHandler.bind(null, reply))
                    case 'status':
                        return getCurrent(chatId, sessionHash)
                            .then((song) => {
                                return reply.text(formatSong(song) || 'Nothing is playing right now')
                            })
                            .catch(errorHandler.bind(null, reply))
                    case 'queue':
                        return getQueue(chatId, sessionHash)
                            .then((queue) => {
                                reply.text(`${queue.length} songs in queue:\n${formatSongList(queue, { prefix: '\t' })}`)
                            })
                            .catch(errorHandler.bind(null, reply))
                }
            })
            .catch(errorHandler.bind(null, reply))
    })
}

const port = process.env.PORT || 3600
server.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`)
    /* eslint-enable no-console */
})
