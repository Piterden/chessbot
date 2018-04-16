const Telegraf = require('telegraf')


const { Markup } = Telegraf

module.exports = () => Markup.inlineKeyboard([
  [
    { text: 'Back', callback_data: 'back' },
    { text: 'Reverse', callback_data: 'reverse' },
    { text: 'Index', callback_data: 'index' },
  ],
]).extra()
