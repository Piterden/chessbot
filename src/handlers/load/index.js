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

module.exports = () => [
  async (ctx) => {
    const [user] = await ctx.db('users')
      .where('id', ctx.from.id)
      .select()
      
    // const user = users[0]
                
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

    const listMessage = await ctx.replyWithMarkdown(
      `Hi ${ctx.from.first_name || 'stranger'}, I'm the Chess bot.
${inlineKeyboard.length > 1 ? '\n*Available games:*' : ''}`,
      {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }
    )

    ctx.session.listMessage = listMessage
  },
]
