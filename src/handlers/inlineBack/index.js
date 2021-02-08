const chess = require('chess')

const {
  debug,
  getGame,
  isBlackUser,
  isWhiteTurn,
  isWhiteUser,
} = require('@/helpers')
const { board, actions } = require('@/keyboards')

module.exports = () => [
  /^back::(\d+)$/,
  async (ctx) => {
    const game = await getGame(ctx, ctx.match[1])

    if (!isBlackUser(game, ctx) && !isWhiteUser(game, ctx)) {
      return ctx.answerCbQuery('Sorry, this game is busy. Try to make a new one.')
    }

    ctx.game.entry = game

    if (ctx.game.lastBoard) {
      await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
        .catch(debug)

      return ctx.answerCbQuery()
    }

    const gameMoves = await ctx.db('moves')
      .where('game_id', game.id)
      .orderBy('created_at', 'asc')
      .catch(debug)

    if ((isWhiteTurn(gameMoves) && isBlackUser(game, ctx)) ||
      (!isWhiteTurn(gameMoves) && isWhiteUser(game, ctx))) {
      return ctx.answerCbQuery('Wait, please. Now is not your turn.')
    }

    const gameClient = chess.create({ PGN: true })

    gameMoves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    let status = gameClient.getStatus()

    ctx.game.lastBoard = board({
      board: status.board.squares,
      isWhite: isWhiteTurn(gameMoves),
      actions: actions(),
    })
  },
]
