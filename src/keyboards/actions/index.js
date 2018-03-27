const Telegraf = require('telegraf')


const { Markup } = Telegraf

// const actions = ['Reverse', ]

module.exports = () => Markup.inlineKeyboard([
  [
    { text: 'Reverse', callback_data: 'reverse' },
    { text: 'Index', callback_data: 'index' },
  ],
]).extra()
