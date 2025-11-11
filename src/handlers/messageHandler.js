import { debug } from '../helpers.js'
import { getGame } from '../database.js'

export default () => [
  'text',
  async (ctx) => {
    const game = await getGame(ctx.session.gameId)

    if (!game) {
      return true
    }

    const to = Number(game.user_w) === ctx.from.id
      ? Number(game.user_b)
      : Number(game.user_w)

    await ctx.tg.sendMessage(to, `${ctx.from.first_name}
-----------------------------
${ctx.message.text}`)
      .catch(debug)

    return true
  },
]
