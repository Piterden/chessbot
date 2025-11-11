import { debug } from '../helpers.js'
import { actions } from '../keyboards/index.js'

export default () => [
  /^options\/(show|hide)$/,
  async (ctx) => {
    const [, open] = ctx.match
    await ctx.editMessageReplyMarkup(actions(open === 'show').reply_markup)
      .catch(debug)
  },
]
