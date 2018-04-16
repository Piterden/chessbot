const chess = require('chess')

const { debug } = require('../../helpers')
const { board, actions } = require('../../keyboards')


// eslint-disable-next-line no-magic-numbers
const isWhiteTurn = (moves) => !(moves.length % 2)

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

    movesState.forEach((move) => {
      try {
        gameClient.move(move.move)
      }
      catch (error) {
        debug(`::${move}::`)
        debug(error)
      }
    })

    const status = gameClient.getStatus()

    ctx.session.moves = []
    ctx.session.selected = null
    ctx.session.mode = 'select'

    if (ctx.from.id === gameState.user_w) {
      let whiteBoardMsg
      let whiteActionsMsg

      try {
        whiteBoardMsg = await ctx.reply(
          `${!isWhiteTurn(movesState) ? '*' : ''} (BLACK) User ${gameState.user_b || 'waiting...'}`,
          board(status.board.squares, true)
        )
      }
      catch (error) {
        debug('::whiteBoardMsg::')
        debug(error)
      }

      try {
        whiteActionsMsg = await ctx.reply(
          `${isWhiteTurn(movesState) ? '*' : ''} (WHITE) YOU`,
          actions()
        )
      }
      catch (error) {
        debug('::whiteActionsMsg::')
        debug(error)
      }

      if (
        whiteBoardMsg.message_id !== gameState.board_w
        || whiteActionsMsg.message_id !== gameState.actions_w
      ) {
        try {
          await ctx.db('games').where({ id: gameState.id }).update({
            board_w: whiteBoardMsg.message_id,
            actions_w: whiteActionsMsg.message_id,
          })
        }
        catch (error) {
          debug('::whiteDBUPD::')
          debug(error)
        }
      }
    }

    if (ctx.from.id === gameState.user_b) {
      let blackBoardMsg
      let blackActionsMsg

      try {
        blackBoardMsg = await ctx.reply(
          `${isWhiteTurn(movesState) ? '*' : ''} (WHITE) User ${gameState.user_w}`,
          board(status.board.squares, false)
        )
      }
      catch (error) {
        debug('::blackBoardMsg::')
        debug(error)
      }

      try {
        blackActionsMsg = await ctx.reply(
          `${!isWhiteTurn(movesState) ? '*' : ''} (BLACK) YOU`,
          actions()
        )
      }
      catch (error) {
        debug('::blackActionsMsg::')
        debug(error)
      }

      if (
        blackBoardMsg.message_id !== gameState.board_b
        || blackActionsMsg.message_id !== gameState.actions_b
      ) {
        try {
          await ctx.db('games').where({ id: gameState.id }).update({
            board_b: blackBoardMsg.message_id,
            actions_b: blackActionsMsg.message_id,
          })
        }
        catch (error) {
          debug('::blackDBUPD::')
          debug(error)
        }
      }
    }

    return ctx.answerCbQuery(isWhiteTurn(movesState) ? 'White' : 'Black')
  },
]
