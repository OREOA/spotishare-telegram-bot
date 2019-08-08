const InfoError = require('./InfoError')

const errorHandler = (reply, error) => {
    if (error.response && error.response.data) {
        return reply.text(error.response && error.response.data)
    }
    if (error instanceof InfoError) {
        return reply.text(error.message)
    }
    reply.text(`Error happened! Message: ${error.message}`)
}

module.exports = errorHandler