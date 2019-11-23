const { debug } = require('@/helpers')
const loadHandler = require('../load')

module.exports = () => [
  async (ctx) => {
    if (ctx.session.board) {
      await ctx.deleteMessage(ctx.session.board).catch(debug)
      ctx.session.board = null
    }

    if (ctx.session.actions) {
      await ctx.deleteMessage(ctx.session.actions).catch(debug)
      ctx.session.actions = null
    }

    await loadHandler()[0](ctx)

    return ctx.answerCbQuery()
  },
]
