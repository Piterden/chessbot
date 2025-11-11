import { debug } from '../helpers.js'

export default () => [
  async (ctx) => {
    if (ctx.session.listMessage) {
      await ctx.deleteMessage(ctx.session.listMessage.message_id).catch(debug)
      ctx.session.listMessage = null
    }
  },
]
