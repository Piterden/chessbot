const chess = require('chess')

const { debug } = require('../../helpers')
const { board, actions } = require('../../keyboards')


module.exports = () => [
  async (ctx) => {
    debug(ctx.from)
    ctx.session.chess = chess.create({ PGN: true })

    const status = ctx.session.chess.getStatus()

    ctx.session.mode = 'select'
    ctx.session.eaten = { white: [], black: [] }
    ctx.session.moves = []
    ctx.session.selected = null
    ctx.session.whitesTurn = true

    try {
      ctx.session.board = await ctx.reply('(B)', board(status.board.squares, true))
      ctx.session.actions = await ctx.reply('(W)', actions())
    }
    catch (error) {
      debug(error)
    }
  },
]
