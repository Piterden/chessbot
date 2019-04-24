const chess = require('chess')

const { debug } = require('@/helpers')
const { board } = require('@/keyboards')

const gameClient = chess.create({ PGN: true })
const status = gameClient.getStatus()

module.exports = () => [
  'inline_query',
  async (ctx) => {
    debug(ctx.update)
    await ctx.answerInlineQuery([
      {
        id: 1,
        type: 'photo',
        thumb_url: 'https://crossword.live/img/w.png',
        photo_url: 'https://crossword.live/img/w.png',
        title: 'Play with white pieces',
        input_message_content: {
          message_text: `Black (top): ?
White (bottom): ${ctx.update.inline_query.from.first_name}`,
        },
        ...board(status.board.squares, true),
      },
      {
        id: 2,
        type: 'photo',
        thumb_url: 'https://crossword.live/img/b.png',
        photo_url: 'https://crossword.live/img/b.png',
        title: 'Play with black pieces',
        input_message_content: {
          message_text: `White (top): ?
Black (bottom): ${ctx.update.inline_query.from.first_name}`,
        },
        ...board(status.board.squares, false),
      },
    ], {
      is_personal: true,
      cache_time: 0,
    })
  },
]
