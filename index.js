const TelegramBot = require('node-telegram-bot-api')

// replace the value below with the Telegram token you receive from @BotFather
const token = '954260187:AAEHEH2W0NPd7DMczCA8qmjcn-y5LM-pgA8'

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true })

bot.onText(/\/login/, (msg, match) => {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'uliuliuli')
})

bot.onText(/\/queue/, (msg, match) => {
    console.log('uliuliuliu')
})

// Matches "/echo [whatever]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
//     // 'msg' is the received Message from Telegram
//     // 'match' is the result of executing the regexp above on the text content
//     // of the message
//
//     const chatId = msg.chat.id;
//     const resp = match[1]; // the captured "whatever"
//
//     // send back the matched "whatever" to the chat
//     bot.sendMessage(chatId, resp);
// });

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//
//     // send a message to the chat acknowledging receipt of their message
//     bot.sendMessage(chatId, 'Received your message');
// })