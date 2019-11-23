// const { debug } = require('../../helpers')

const isWhiteTurn = (moves) => !(moves.length % 2)

const whiteUserName = (ctx, game) =>
  Number(game.whites_id) === ctx.from.id
    ? `${isWhiteTurn(game.moves) ? '!!! ' : ''}YOU`
    : game.whites_id

const blackUserName = (ctx, game) =>
  Number(game.blacks_id) === ctx.from.id
    ? `YOU${!isWhiteTurn(game.moves) ? ' !!!' : ''}`
    : game.blacks_id ? game.blacks_id : 'Waiting...'

const gameButton = (ctx, game) => ({
  text: `${whiteUserName(ctx, game)} / ${blackUserName(ctx, game)} | ${
    game.moves.length
  } moves`,
  callback_data: `join/${game.id}`,
})

module.exports = () => [
  async (ctx) => {
    let games = await ctx
      .db('games')
      .whereNull('blacks_id')
      .orWhere('blacks_id', ctx.from.id)
      .orWhere('whites_id', ctx.from.id)
      .orderBy('created_at', 'asc')
      .select()

    games = await Promise.all(
      games.map(async (game) => ({
        ...game,
        moves: await ctx
          .db('moves')
          .where('game_id', game.id)
          .orderBy('created_at', 'asc')
          .select(),
      }))
    )

    const inlineKeyboard = games.map((game) => [gameButton(ctx, game)])

    inlineKeyboard.push([{ text: 'Create a new game', callback_data: 'new' }])

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
