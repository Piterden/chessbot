import { debug } from '../helpers.js'
import { getGame, updateGame } from '../database.js'

export default () => [
  /^join\/(\d+)$/,
  async (ctx) => {
    const game = await getGame(Number(ctx.match[1]))

    if (!game.user_b && Number(game.user_w) !== ctx.from.id) {
      await updateGame(game.id, { user_b: ctx.from.id }).catch(debug)
    }

    if (!game.user_w && Number(game.user_b) !== ctx.from.id) {
      await updateGame(game.id, { user_w: ctx.from.id }).catch(debug)
    }

    ctx.session.gameId = game.id
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  },
]
