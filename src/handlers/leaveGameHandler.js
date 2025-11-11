import { debug } from '../helpers.js'

export default () => [
  async (ctx) => {
    if (ctx.session.board) {
      await ctx.deleteMessage(ctx.session.board.message_id).catch(debug)
      ctx.session.board = null
    }

    if (ctx.session.actions) {
      await ctx.deleteMessage(ctx.session.actions.message_id).catch(debug)
      ctx.session.actions = null
    }
  },
]
