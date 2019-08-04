const errorHandler = (reply, error) => {
    reply.text(error.response && error.response.data || `Error happened! Message: ${error.message}`)
}

module.exports = errorHandler