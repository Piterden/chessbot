import { debug } from '../helpers.js'
import { addGame } from '../database.js'

export default () => [
  /^new$/,
  async (ctx) => {
    const id = await addGame({ user_w: ctx.from.id })

    ctx.session.gameId = id
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  },
]
