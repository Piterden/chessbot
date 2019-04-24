const { debug } = require('@/helpers')
const { board } = require('@/keyboards')

const img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Starting_position_in_a_chess_game.jpg/1024px-Starting_position_in_a_chess_game.jpg'

module.exports = () => [
  'inline_query',
  async (ctx) => {
    debug(ctx.from)
    await ctx.answerInlineQuery([
      {
        id: 1,
        type: 'article',
        thumb_url: img,
        title: 'Play',
        input_message_content: {
          message_text: 'hi',
        },
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Hi', callback_data: 'hi' },
            ],
          ],
        },
      },
    ])
  },
]
