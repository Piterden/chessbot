const chess = require('chess')

const { debug } = require('@/helpers')
const { board, actions } = require('@/keyboards')

// eslint-disable-next-line no-magic-numbers
const isWhiteTurn = (moves) => !(moves.length % 2)

module.exports = () => [
  async (ctx) => {
    const games = await ctx.db('games')
      .where('id', ctx.session.gameId)
      .select()

    const gameState = games[0]

    const movesState = await ctx.db('moves')
      .where('game_id', ctx.session.gameId)
      .orderBy('created_at', 'asc')
      .select()

    const whiteUsers = await ctx.db('users')
      .where('id', Number(gameState.user_w))
      .select()
    const whiteUser = whiteUsers[0]

    const blackUsers = await ctx.db('users')
      .where('id', Number(gameState.user_b))
      .select()
    const blackUser = blackUsers[0]

    const gameClient = chess.create({ PGN: true })

    movesState.forEach((move) => {
      try {
        gameClient.move(move.move)
      } catch (error) {
        debug(`::${move}::`)
        debug(error)
      }
    })

    const status = gameClient.getStatus()

    ctx.session.moves = []
    ctx.session.selected = null
    ctx.session.mode = 'select'

    if (ctx.from.id === Number(gameState.user_w)) {
      let whiteBoardMsg
      let whiteActionsMsg

      try {
        whiteBoardMsg = await ctx.reply(
          `${!isWhiteTurn(movesState) ? '*' : ''} (BLACK) User ${unescape(blackUser.first_name) || 'waiting...'}`,
          board(status.board.squares, true)
        )
      } catch (error) {
        debug('::whiteBoardMsg::')
        debug(error)
      }

      try {
        whiteActionsMsg = await ctx.reply(
          `${isWhiteTurn(movesState) ? '*' : ''} (WHITE) YOU`,
          actions()
        )
      } catch (error) {
        debug('::whiteActionsMsg::')
        debug(error)
      }

      if (
        whiteBoardMsg.message_id !== Number(gameState.board_w) ||
        whiteActionsMsg.message_id !== Number(gameState.actions_w)
      ) {
        try {
          await ctx.db('games').where('id', gameState.id).update({
            board_w: whiteBoardMsg.message_id,
            actions_w: whiteActionsMsg.message_id,
          })
        } catch (error) {
          debug('::whiteDBUPD::')
          debug(error)
        }
      }

      ctx.session.board = whiteBoardMsg.message_id
      ctx.session.actions = whiteActionsMsg.message_id
    }

    if (ctx.from.id === Number(gameState.user_b)) {
      let blackBoardMsg
      let blackActionsMsg

      try {
        blackBoardMsg = await ctx.reply(
          `${isWhiteTurn(movesState) ? '*' : ''} (WHITE) User ${unescape(whiteUser.first_name)}`,
          board(status.board.squares, false)
        )
      } catch (error) {
        debug('::blackBoardMsg::')
        debug(error)
      }

      try {
        blackActionsMsg = await ctx.reply(
          `${!isWhiteTurn(movesState) ? '*' : ''} (BLACK) YOU`,
          actions()
        )
      } catch (error) {
        debug('::blackActionsMsg::')
        debug(error)
      }

      if (
        blackBoardMsg.message_id !== Number(gameState.board_b) ||
        blackActionsMsg.message_id !== Number(gameState.actions_b)
      ) {
        try {
          await ctx.db('games').where('id', gameState.id).update({
            board_b: blackBoardMsg.message_id,
            actions_b: blackActionsMsg.message_id,
          })
        } catch (error) {
          debug('::blackDBUPD::')
          debug(error)
        }
      }

      ctx.session.board = blackBoardMsg.message_id
      ctx.session.actions = blackActionsMsg.message_id
    }

    return ctx.answerCbQuery()
  },
]
