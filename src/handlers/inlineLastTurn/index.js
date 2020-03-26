const chess = require('chess')

const {
  debug,
  sleep,
  getGame,
  isBlackTurn,
  isWhiteTurn,
  isWhiteUser,
  isBlackUser,
} = require('@/helpers')
const { board } = require('@/keyboards')

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
      return true
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
    const currentBoard = board(
      currentStatus.board.squares,
      isWhiteTurn(moves),
      [{
        text: 'Settings',
        callback_data: 'settings',
      }, {
        text: 'Last turn',
        callback_data: 'last',
      }, {
        text: 'New game',
        switch_inline_query_current_chat: '',
      }]
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
    const beforeBoard = board(
      beforeStatus.board.squares,
      !isWhiteTurn(moves),
      [{
        text: 'Settings',
        callback_data: 'settings',
      }, {
        text: 'Last turn',
        callback_data: 'last',
      }, {
        text: 'New game',
        switch_inline_query_current_chat: '',
      }]
    )

    await ctx.editMessageReplyMarkup(beforeBoard.reply_markup).catch(debug)
    await sleep(400)
    await ctx.editMessageReplyMarkup(currentBoard.reply_markup).catch(debug)
    return ctx.answerCbQuery()
  },
]
