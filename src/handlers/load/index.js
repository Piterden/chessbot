const { debug } = require('../../helpers')


const COLS = 2

// eslint-disable-next-line no-magic-numbers
const isWhiteTurn = (moves) => !(moves.length % 2)

const whiteUserName = (ctx, game) => game.user_w === ctx.from.id
  ? 'YOU'
  : game.user_w

const blackUserName = (ctx, game) => {
  if (ctx.from.id === game.user_b) {
    return 'YOU'
  }
  return game.user_b ? game.user_b : 'Waiting...'
}

const yourTurn = (ctx, game) => {
  if (isWhiteTurn(game.moves)) {
    return true
  }
  return false
}

const gameButton = (ctx, game) => ({
  text: `${yourTurn(ctx, game) ? '!!!' : ''}${whiteUserName(ctx, game)} / ${blackUserName(ctx, game)}`,
  callback_data: `join/${game.id}`,
})

module.exports = () => [
  async (ctx) => {
    let games = await ctx.db('games')
      .whereNull('user_b')
      .orWhere('user_b', ctx.from.id)
      .orWhere('user_w', ctx.from.id)
      .select()

    games = await Promise.all(games.map(async (game) => Object.assign(game, {
      moves: await ctx.db('moves')
        .where('game_id', game.id)
        .orderBy('created_at', 'asc')
        .select(),
    })))

    debug(games)

    const inlineKeyboard = games.reduce((acc, game) => {
      if (acc.length === 0 || acc[acc.length - 1].length === COLS) {
        acc.push([gameButton(ctx, game)])
      }
      else {
        acc[acc.length - 1].push(gameButton(ctx, game))
      }
      return acc
    }, [])

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
