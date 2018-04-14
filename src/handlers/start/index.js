const chess = require('chess')

const { debug } = require('../../helpers')
const { board, actions } = require('../../keyboards')


module.exports = () => [
  async (ctx) => {
    const gameState = await ctx.db.from('games')
      .where({ id: ctx.session.gameId })
      .first()

    const gameClient = chess.create({ PGN: true })
    const status = gameClient.getStatus()

    ctx.session.eaten = { white: [], black: [] }
    ctx.session.moves = []
    ctx.session.selected = null
    ctx.session.whitesTurn = true

    if (ctx.from.id === gameState.user_w) {
      ctx.session.mode = 'select'

      try {
        const { message_id: whiteBoardMsgId } = await ctx.reply(
          '(B)',
          board(status.board.squares, true)
        )
        const { message_id: whiteActionsMsgId } = await ctx.reply(
          '(W)',
          actions()
        )

        ctx.db('games').where({ id: ctx.session.gameId }).update({
          board_w: whiteBoardMsgId,
          actions_w: whiteActionsMsgId,
        })
      }
      catch (error) {
        debug(error)
      }
    }

    if (ctx.from.id === gameState.user_b) {
      ctx.session.mode = 'freeze'

      try {
        const { message_id: blackBoardMsgId } = await ctx.reply(
          '(W)',
          board(status.board.squares, false)
        )
        const { message_id: blackActionsMsgId } = await ctx.reply(
          '(B)',
          actions()
        )

        ctx.db('games').where({ id: ctx.session.gameId }).update({
          board_b: blackBoardMsgId,
          actions_b: blackActionsMsgId,
        })
      }
      catch (error) {
        debug(error)
      }
    }

    return ctx.answerCbQuery()
  },
]
