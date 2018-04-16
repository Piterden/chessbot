const COLS = 2

const whiteUserName = (ctx, game) => game.user_w === ctx.from.id
  ? 'YOU'
  : game.user_w

const blackUserName = (ctx, game) => {
  if (ctx.from.id === game.user_b) {
    return 'YOU'
  }
  return game.user_b ? game.user_b : 'Waiting...'
}

const gameButton = (ctx, game) => ({
  text: `${whiteUserName(ctx, game)} / ${blackUserName(ctx, game)}`,
  callback_data: `join/${game.id}`,
})

module.exports = () => [
  async (ctx) => {
    const games = await ctx.db.from('games')
      .whereNull('user_b')
      .orWhere('user_b', ctx.from.id)
      .orWhere('user_w', ctx.from.id)
      .select()

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
