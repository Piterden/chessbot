const { debug } = require('../../helpers')


module.exports = () => [
  /^new$/,
  async (ctx) => {
    const [gameId] = await ctx.db('games')
      .returning('id')
      .insert({ user_w: ctx.from.id })

    if (ctx.session.listMessage) {
      try {
        await ctx.deleteMessage(ctx.session.listMessage.message_id)
      }
      catch (error) {
        debug(error)
      }
      ctx.session.listMessage = null
    }

    ctx.session.gameId = gameId
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  },
]
