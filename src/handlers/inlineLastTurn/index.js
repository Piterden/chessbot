const chess = require('chess')

const {
  log,
  debug,
  sleep,
  preLog,
  getGame,
  isBlackTurn,
  isWhiteTurn,
  isWhiteUser,
  isBlackUser,
  makeUserLog,
} = require('@/helpers')
const { board, actions } = require('@/keyboards')

module.exports = () => [
  /^last$/,
  async (ctx) => {
    const game = await getGame(ctx).catch(debug)

    if (typeof game === 'boolean') {
      return game
    }

    const moves = await ctx.db('moves')
      .where('game_id', game.id)
      .orderBy('created_at', 'asc')
      .select()
      .catch(debug)

    if (!((isWhiteUser(game, ctx) && isWhiteTurn(moves)) ||
      (isBlackUser(game, ctx) && isBlackTurn(moves)))) {
      return ctx.answerCbQuery('Don\'t touch')
    }

    const currentGame = chess.create({ PGN: true })

    moves.forEach(({ entry }) => {
      try {
        currentGame.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    const currentStatus = currentGame.getStatus()
    const currentBoard = board({
      board: currentStatus.board.squares,
      isWhite: isWhiteTurn(moves),
      actions: actions(),
    })

    log(
      preLog('LAST', `${game.id} ${moves.length} ${makeUserLog(ctx.from)}`),
      ctx
    )

    const beforeGame = chess.create({ PGN: true })

    moves.pop()
    moves.forEach(({ entry }) => {
      try {
        beforeGame.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    const beforeStatus = beforeGame.getStatus()
    const beforeBoard = board({
      board: beforeStatus.board.squares,
      isWhite: !isWhiteTurn(moves),
      actions: actions(),
    })

    await ctx.editMessageReplyMarkup(beforeBoard.reply_markup).catch(debug)
    await sleep(400)
    await ctx.editMessageReplyMarkup(currentBoard.reply_markup).catch(debug)
    return ctx.answerCbQuery()
  },
]
