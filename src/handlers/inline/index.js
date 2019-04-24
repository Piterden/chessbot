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
        thumb_url: 'https://crossword.live/img/w.png',
        title: 'Play',
        input_message_content: {
          message_text: `${ctx.from.first_name} is white side.`,
        },
        reply_markup: markup,
      },
      {
        id: 2,
        type: 'photo',
        thumb_url: 'https://crossword.live/img/b.png',
        title: 'Play',
        input_message_content: {
          message_text: `${ctx.from.first_name} is black side.`,
        },
        reply_markup: markup,
      },
    ])
  },
]
