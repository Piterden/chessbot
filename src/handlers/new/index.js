const { debug } = require('@/helpers')


module.exports = () => [
  /^new$/,
  async (ctx) => {
    const [gameId] = await ctx.db('games')
      .returning('id')
      .insert({ user_w: ctx.from.id })

    if (ctx.session.listMessage) {
      try {
        await ctx.deleteMessage(ctx.session.listMessage.message_id)

        ctx.session.gameId = gameId
        ctx.scene.enter('game')
      }
      catch (error) {
        debug(error)
        ctx.session.listMessage = null
      }
    }

    return ctx.answerCbQuery()
  },
]
