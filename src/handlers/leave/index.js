const loadHandler = require('../load')


module.exports = () => [
  async (ctx) => {
    await ctx.deleteMessage(ctx.session.board)
    await ctx.deleteMessage(ctx.session.actions)

    await loadHandler()[0](ctx)

    return ctx.answerCbQuery()
  },
]
