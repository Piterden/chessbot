const { debug } = require('../../helpers')


module.exports = () => [
  /^join\/(\d+)$/,
  async (ctx) => {
    const games = await ctx.db('games')
      .where('id', Number(ctx.match[1]))
      .select()

    const gameState = games[0]

    if (!gameState.user_b && Number(gameState.user_w) !== ctx.from.id) {
      await ctx.db('games')
        .where('id', gameState.id)
        .update({ user_b: ctx.from.id })
    }

    if (ctx.session.listMessage) {
      try {
        await ctx.deleteMessage(ctx.session.listMessage.message_id)
      }
      catch (error) {
        debug(error)
      }
      ctx.session.listMessage = null
    }

    ctx.session.gameId = gameState.id
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  },
]
