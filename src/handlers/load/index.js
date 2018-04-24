const { debug } = require('../../helpers')


// eslint-disable-next-line no-magic-numbers
const isWhiteTurn = (moves) => !(moves.length % 2)

const whiteUserName = (ctx, game) => Number(game.user_w) === ctx.from.id
  ? `${isWhiteTurn(game.moves) ? '!!! ' : ''}YOU`
  : game.user_w

const blackUserName = (ctx, game) => {
  if (ctx.from.id === Number(game.user_b)) {
    return `YOU${!isWhiteTurn(game.moves) ? ' !!!' : ''}`
  }
  return game.user_b ? game.user_b : 'Waiting...'
}

const gameButton = (ctx, game) => ({
  text: `${whiteUserName(ctx, game)} / ${blackUserName(ctx, game)} | ${game.moves.length} moves`,
  callback_data: `join/${game.id}`,
})

const escapeUser = (user) => Object.keys(user).reduce((acc, key) => {
  acc[key] = escape(user[key])
  return acc
}, {})

const unescapeUser = (user) => Object.keys(user).reduce((acc, key) => {
  acc[key] = unescape(user[key])
  return acc
}, {})

module.exports = () => [
  async (ctx) => {
    let user = await ctx.db('users').where('id', ctx.from.id).first()
    
    if (typeof user === 'undefined') {
      const users = await ctx.db('users')
        .insert(escapeUser(ctx.from))
        .returning(Object.keys(ctx.from))

      user = unescapeUser(users[0]) // eslint-disable-line prefer-destructuring
    }
    else {
      await ctx.db('users').where('id', user.id).update(escapeUser(ctx.from))
    }
                                                      
    debug(user)
                    
    let games = await ctx.db('games')
      .whereNull('user_b')
      .orWhere('user_b', ctx.from.id)
      .orWhere('user_w', ctx.from.id)
      .orderBy('created_at', 'asc')
      .select()

    games = await Promise.all(games.map(async (game) => ({
      ...game,
      moves: await ctx.db('moves')
        .where('game_id', game.id)
        .orderBy('created_at', 'asc')
        .select(),
    })))

    const inlineKeyboard = games.map((game) => [gameButton(ctx, game)])

    inlineKeyboard.push([
      { text: 'Create a new game', callback_data: 'new' },
    ])

    ctx.session.listMessage = await ctx.replyWithMarkdown(
      `Hi ${ctx.from.first_name || 'stranger'}, I'm the Chess bot.
${inlineKeyboard.length > 1 ? '\n*Available games:*' : ''}`,
      {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }
    )
  },
]
