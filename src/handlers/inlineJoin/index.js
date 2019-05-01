const chess = require('chess')

const { board } = require('@/keyboards')
const { debug } = require('@/helpers')

module.exports = () => [
  /^join::([wb])::(\d+)/,
  async (ctx) => {
    debug(ctx.update)
    const enemyId = Number(ctx.match[2])
    const iAmWhite = ctx.match[1] !== 'w'

    if (ctx.from.id === enemyId) {
      return ctx.answerCbQuery('You can\'t join yourself!')
    }

    let user = await ctx.db('users')
      .where({ id: ctx.from.id })
      .first()
      .catch(debug)

    if (!user) {
      await ctx.db('users').insert(ctx.from).catch(debug)
      user = await ctx.db('users').where('id', ctx.from.id).first().catch(debug)
    }

    const enemy = await ctx.db('users').where('id', enemyId).first().catch(debug)

    await ctx.db('games').insert({
      whites_id: iAmWhite ? ctx.from.id : enemy.id,
      blacks_id: iAmWhite ? enemy.id : ctx.from.id,
      inline_id: ctx.callbackQuery.inline_message_id,
    }).catch(debug)

    const game = await ctx.db('games')
      .where('inline_id', ctx.callbackQuery.inline_message_id)
      .first()
      .catch(debug)

    if (!game) {
      await ctx.removeMessage()
      return ctx.answerCbQuery('Game was removed, sorry. Please try to start a new one, typing @chessy_bot to your message input.')
    }

    ctx.game.id = game.gameId
    ctx.game.inlineId = ctx.callbackQuery.inline_message_id

    const gameClient = chess.create({ PGN: true })
    const status = gameClient.getStatus()

    await ctx.editMessageText(
      iAmWhite
        ? `Black (top): ${enemy.first_name}
White (bottom): ${user.first_name}
White's turn`
        : `Black (top): ${user.first_name}
White (bottom): ${enemy.first_name}
White's turn`,
      board(status.board.squares, true)
    )

    return ctx.answerCbQuery('Now play!')
  },
]
