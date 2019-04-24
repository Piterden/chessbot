const chess = require('chess')

const { board } = require('@/keyboards')
const { debug, unescapeUser, escapeUser } = require('@/helpers')

const gameClient = chess.create({ PGN: true })
const status = gameClient.getStatus()

module.exports = () => [
  'inline_query',
  async (ctx) => {
    debug(ctx.update)

    let user = await ctx.db('users')
      .where('id', ctx.update.inline_query.from.id)
      .first()

    if (user) {
      user = unescapeUser(user)

      if (JSON.stringify(user) !== JSON.stringify(ctx.update.inline_query.from)) {
        await ctx.db('users')
          .where('id', user.id)
          .update(escapeUser(ctx.update.inline_query.from))
      }
    } else {
      const users = await ctx.db('users')
        .insert(escapeUser(ctx.update.inline_query.from))
        .returning(Object.keys(ctx.update.inline_query.from))

      user = unescapeUser(users[0])
    }

    await ctx.answerInlineQuery([
      {
        id: 1,
        type: 'photo',
        thumb_url: 'https://crossword.live/img/w.png',
        photo_url: 'https://crossword.live/img/w.png',
        title: 'Play with white pieces',
        input_message_content: {
          message_text: `Black (top): ?
White (bottom): ${user.first_name}`,
        },
        ...board(status.board.squares, true, [{
          text: 'Join the game',
          callback_data: `join::w::${user.id}`,
        }]),
      },
      {
        id: 2,
        type: 'photo',
        thumb_url: 'https://crossword.live/img/b.png',
        photo_url: 'https://crossword.live/img/b.png',
        title: 'Play with black pieces',
        input_message_content: {
          message_text: `White (top): ?
Black (bottom): ${user.first_name}`,
        },
        ...board(status.board.squares, false, [{
          text: 'Join the game',
          callback_data: `join::b::${user.id}`,
        }]),
      },
    ], {
      is_personal: true,
      cache_time: 0,
    })
  },
]
