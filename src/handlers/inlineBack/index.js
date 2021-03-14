const chess = require('chess')

const {
  debug,
  getGame,
  topMessage,
  isBlackUser,
  isWhiteTurn,
  isWhiteUser,
  statusMessage,
  makeBoardImageUrl,
} = require('@/helpers')
const { board, actions } = require('@/keyboards')

module.exports = () => [
  /^back::(\d+)$/,
  async (ctx) => {
    const game = await getGame(ctx, ctx.match[1])

    if (!isBlackUser(game, ctx) && !isWhiteUser(game, ctx)) {
      return ctx.answerCbQuery('Sorry, this game is busy. Try to make a new one.')
    }

    const gameMoves = await ctx.db('moves')
      .where('game_id', game.id)
      .orderBy('created_at', 'asc')
      .catch(debug)

    if ((isWhiteTurn(gameMoves) && isBlackUser(game, ctx)) ||
      (!isWhiteTurn(gameMoves) && isWhiteUser(game, ctx))) {
      return ctx.answerCbQuery('Wait, please. Now is not your turn.')
    }

    const enemy = ctx.db('users')
      .where('id', isWhiteTurn(gameMoves) ? game.blacks_id : game.whites_id)
      .first()
      .catch(debug)

    const gameClient = chess.create({ PGN: true })

    gameMoves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    const status = gameClient.getStatus()

    await ctx.editMessageMedia(
      {
        type: 'photo',
        media: makeBoardImageUrl(gameClient.getFen(), { rotate: Number(!isWhiteTurn(gameMoves)) }),
        caption: topMessage(!isWhiteTurn(gameMoves), enemy, ctx.from) + statusMessage(status),
      },
      {
        ...board({
          board: status.board.squares,
          isWhite: isWhiteTurn(gameMoves),
          actions: actions(),
        }),
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    ).catch(debug)
  },
]
