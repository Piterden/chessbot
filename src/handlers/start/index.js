const chess = require('chess')

const { debug } = require('../../helpers')
const { board, actions } = require('../../keyboards')


module.exports = () => [
  async (ctx) => {
    const gameState = await ctx.db('games')
      .where({ id: ctx.session.gameId })
      .first()

    const movesState = await ctx.db('moves')
      .where({ game_id: ctx.session.gameId })
      .orderBy('created_at', 'asc')
      .select()

    const gameClient = chess.create({ PGN: true })

    movesState.forEach(({ move }) => {
      gameClient.move(move)
    })

    const status = gameClient.getStatus()

    ctx.session.eaten = { white: [], black: [] }
    ctx.session.moves = []
    ctx.session.selected = null
    ctx.session.mode = 'select'

    if (ctx.from.id === gameState.user_w) {
      try {
        const { message_id: whiteBoardMsgId } = await ctx.reply(
          '(BLACK)',
          board(status.board.squares, true)
        )
        const { message_id: whiteActionsMsgId } = await ctx.reply(
          '(WHITE)',
          actions()
        )

        await ctx.db('games').where({ id: gameState.id }).update({
          board_w: whiteBoardMsgId,
          actions_w: whiteActionsMsgId,
        })
      }
      catch (error) {
        debug(error)
      }
    }

    if (ctx.from.id === gameState.user_b) {
      try {
        const { message_id: blackBoardMsgId } = await ctx.reply(
          '(WHITE)',
          board(status.board.squares, false)
        )
        const { message_id: blackActionsMsgId } = await ctx.reply(
          '(BLACK)',
          actions()
        )

        await ctx.db('games').where({ id: ctx.session.gameId }).update({
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
