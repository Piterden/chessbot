const chess = require('chess')

const { board, actions } = require('@/keyboards')

module.exports = () => [
  /^\s*(?:[rnbqkp1-8]{1,8}\/){7}[rnbqkp1-8]+\s+[wb]\s*$/i,
  async (ctx) => {
    const game = chess.fromFEN(ctx.message.text)
    const status = game.getStatus()
    const [position, side] = ctx.message.text.split(/\s+/)

    ctx.game.lastBoard = board({
      board: status.board.squares,
      isWhite: side === 'w',
      actions: actions(),
      callbackOverride: 'fen::',
    })

    ctx.reply(ctx.message.text, {
      ...ctx.game.lastBoard,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    })
  }
]
