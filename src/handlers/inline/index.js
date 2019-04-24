const chess = require('chess')

const { debug } = require('@/helpers')
const { board } = require('@/keyboards')

const gameClient = chess.create({ PGN: true })
const status = gameClient.getStatus()

const escapeUser = (user) => Object.keys(user).reduce((acc, key) => {
  acc[key] = typeof user[key] === 'string' ? escape(user[key]) : user[key]
  return acc
}, {})

const unescapeUser = (user) => Object.keys(user).reduce((acc, key) => {
  acc[key] = typeof user[key] === 'string' ? unescape(user[key]) : user[key]
  return acc
}, {})

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
White (bottom): ${ctx.update.inline_query.from.first_name}`,
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
Black (bottom): ${ctx.update.inline_query.from.first_name}`,
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
