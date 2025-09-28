const chess = require('chess')

const { board, actions } = require('@/keyboards')
const {
  log,
  debug,
  preLog,
  getGame,
  isWhiteTurn,
  isWhiteUser,
  isBlackUser,
  makeUserLog,
} = require('@/helpers')

module.exports = () => [
  /^fen::([a-h])([1-8])([QRNB])?$/,
  async (ctx) => {
    debug(ctx.callbackQuery.message)
    const game = ctx.game.game
    const status = game.getStatus()
    const [position, side] = ctx.game.fen.split(/\s+/)

    const pressed = status.board.squares
      .find(({ file, rank }) => file === ctx.match[1] && rank === Number(ctx.match[2]))

    if (pressed && pressed.piece &&
      !(ctx.game.selected &&
        pressed.file === ctx.game.selected.file &&
        pressed.rank === ctx.game.selected.rank)) {
      const allowedMoves = Object.keys(status.notatedMoves)
        .filter((key) => status.notatedMoves[key].src === pressed)
        .map((key) => ({ ...status.notatedMoves[key], key }))

      ctx.editMessageReplyMarkup(board({
        board: status.board.squares.map((square) => {
          const move = allowedMoves
            .find((({ file, rank }) => ({ dest }) => dest.file === file &&
              dest.rank === rank)(square))

          return move ? { ...square, move } : square
        }),
        isWhite: side === 'w',
        actions: actions(),
        callbackOverride: 'fen::',
      }).reply_markup).catch(debug)

      ctx.game.selected = pressed
    }
  }
]
