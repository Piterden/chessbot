const { debug } = require('@/helpers')

module.exports = () => [
  /^settings(?:::(\w+))?$/,
  async (ctx) => {
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          { text: 'Board Rotation', callback_data: 'settings::rotation' },
          { text: '2', callback_data: 'settings::2' },
        ],
        [
          { text: '3', callback_data: 'settings::3' },
          { text: '4', callback_data: 'settings::4' },
        ],
        [
          { text: '⬅️ Back to game', callback_data: 'back' },
        ],
      ],
    })

    return ctx.answerCbQuery('Please choose a setting you want to change!')
  },
]
