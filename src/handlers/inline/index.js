const { debug } = require('@/helpers')
// const { board } = require('@/keyboards')

const markup = {
  inline_keyboard: [
    [
      { text: 'Hi', callback_data: 'hi' },
    ],
  ],
}

module.exports = () => [
  'inline_query',
  async (ctx) => {
    debug(ctx.from)
    await ctx.answerInlineQuery([
      {
        id: 1,
        type: 'photo',
        photo_url: 'https://crossword.live/img/w.png',
        title: 'Play with white pieces',
        input_message_content: {
          message_text: `${ctx.from.first_name} is white side.`,
        },
        reply_markup: markup,
      },
      {
        id: 2,
        type: 'photo',
        photo_url: 'https://crossword.live/img/b.png',
        title: 'Play with black pieces',
        input_message_content: {
          message_text: `${ctx.from.first_name} is black side.`,
        },
        reply_markup: markup,
      },
    ])
  },
]
