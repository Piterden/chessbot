const chess = require('chess')

const { board, actions } = require('@/keyboards')
const { debug, isWhiteTurn, topMessage, statusMessage } = require('@/helpers')

module.exports = () => [
  /^rejoin::(\d+)::(\d+)/,
  async (ctx) => {
    const enemyId = Number(ctx.match[2])

    if (ctx.from.id === enemyId) {
      return ctx.answerCbQuery('You can\'t join yourself!')
    }

    const gameId = Number(ctx.match[1])
    const game = await ctx.db('games')
      .where('id', gameId)
      .first()
      .catch(debug)

    if (!game) {
      return ctx.answerCbQuery('Game was removed, sorry. Please try to start a new one, typing @chessy_bot to your message input.')
    }

    if (ctx.from.id !== game.whites_id && ctx.from.id !== game.blacks_id) {
      return ctx.answerCbQuery('You can\'t join this game!')
    }

    await ctx.db('games')
      .update({
        inline_id: ctx.callbackQuery.inline_message_id,
        updated_at: new Date(),
      })
      .where({ id: gameId })
      .catch(debug)

    ctx.game.entry = game
    ctx.game.config = JSON.parse(game.config) || { rotation: 'dynamic' }
    ctx.game.inlineId = ctx.callbackQuery.inline_message_id

    const moves = await ctx.db('moves')
      .where('game_id', gameId)
      .orderBy('created_at', 'asc')
      .catch(debug)

    const gameClient = chess.create({ PGN: true })

    moves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    const status = gameClient.getStatus()

    const enemy = await ctx.db('users')
      .where('id', enemyId)
      .first()
      .catch(debug)

    const user = await ctx.db('users')
      .where({ id: ctx.from.id })
      .first()
      .catch(debug)

    ctx.game.lastBoard = board({
      board: status.board.squares,
      isWhite: isWhiteTurn(moves),
      actions: actions(),
    })

    await ctx.editMessageText(
      `${topMessage(!isWhiteTurn(moves), user, enemy)}
${statusMessage(status)}`,
      {
        ...ctx.game.lastBoard,
        parse_mode: 'Markdown',
      }
    )

    return ctx.answerCbQuery('Now play!')
  },
]
