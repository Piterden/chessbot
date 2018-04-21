const { debug } = require('../../helpers')
const loadHandler = require('../load')


module.exports = () => [
  async (ctx) => {
    if (ctx.session.board) {
      try {
        await ctx.deleteMessage(ctx.session.board)
      }
      catch (error) {
        debug(error)
      }
      ctx.session.board = null
    }

    if (ctx.session.actions) {
      try {
        await ctx.deleteMessage(ctx.session.actions)
      }
      catch (error) {
        debug(error)
      }
      ctx.session.actions = null
    }

    await loadHandler()[0](ctx)

    return ctx.answerCbQuery()
  },
]
