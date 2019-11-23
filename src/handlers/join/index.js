const { debug } = require('@/helpers')

module.exports = () => [
  /^join\/(\d+)$/,
  async (ctx) => {
    const gameState = await ctx.db('games')
      .where('id', Number(ctx.match[1]))
      .first()
      .catch(debug)

    if (!gameState.blacks_id && Number(gameState.whites_id) !== ctx.from.id) {
      await ctx.db('games')
        .where('id', gameState.id)
        .update({ blacks_id: ctx.from.id })
        .catch(debug)
    }

    if (ctx.session.listMessage) {
      await ctx.deleteMessage(ctx.session.listMessage.message_id)
        .catch(debug)
      ctx.session.listMessage = null
    }

    ctx.session.gameId = gameState.id
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  },
]
