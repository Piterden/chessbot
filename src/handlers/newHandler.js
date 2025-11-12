import { debug } from '../helpers.js'
import { addGame } from '../database.js'

export default () => [
  /^new([wb])$/,
  async (ctx) => {
    const game = ctx.match[1] === 'w'
      ? { user_w: ctx.from.id }
      : { user_b: ctx.from.id }
    const id = await addGame(game)

    ctx.session.gameId = id
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  },
]
