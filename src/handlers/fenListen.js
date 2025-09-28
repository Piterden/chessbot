const chess = require('chess')

const { board, actions } = require('@/keyboards')

module.exports = () => [
  /^\s*(?:[rnbqkp1-8]{1,8}\/){7}[rnbqkp1-8]+\s+[wb]\s*$/i,
  async (ctx) => {
    if (ctx.from.id !== ctx.chat.id) return

    const game = chess.fromFEN(ctx.message.text)
    const status = game.getStatus()
    const [position, side] = ctx.message.text.split(/\s+/)

    ctx.game.game = game
    ctx.game.fen = ctx.message.text

    ctx.reply(ctx.message.text, {
      ...board({
        board: status.board.squares,
        isWhite: side === 'w',
        actions: actions(),
        callbackOverride: 'fen::',
      }),
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    })
  }
]
