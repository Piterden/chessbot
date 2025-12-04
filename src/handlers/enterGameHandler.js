import chess from 'chess'

import { debug, isWhiteTurn } from '../helpers.js'
import { board, actions } from '../keyboards/index.js'
import { getGame, getMoves, getUser, updateGame } from '../database.js'

export default () => [
  async (ctx) => {
    const game = await getGame(ctx.session.gameId)
    const moves = await getMoves(game.id)
    const whiteUser = await getUser(game.user_w)
    const blackUser = await getUser(game.user_b)
    const gameClient = chess.create({ PGN: true })

    moves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    const status = gameClient.getStatus()

    ctx.session.moves = []
    ctx.session.selected = null
    ctx.session.mode = 'select'

    if (ctx.from.id === Number(game.user_w)) {
      const whiteBoardMsg = await ctx.reply(
        `${!isWhiteTurn(moves) ? '*' : ''} (BLACK) User ${blackUser ? unescape(blackUser.first_name) : 'waiting...'}`,
        board(status.board.squares, true)
      ).catch(debug)

      const whiteActionsMsg = await ctx.reply(
        `${isWhiteTurn(moves) ? '*' : ''} (WHITE) YOU`,
        actions()
      ).catch(debug)

      if (whiteBoardMsg.message_id !== Number(game.board_w) ||
        whiteActionsMsg.message_id !== Number(game.actions_w)
      ) {
        await updateGame(game.id, {
          board_w: whiteBoardMsg?.message_id,
          actions_w: whiteActionsMsg?.message_id,
        })
      }

      ctx.session.board = whiteBoardMsg
      ctx.session.actions = whiteActionsMsg
    }

    if (ctx.from.id === Number(game.user_b)) {
      const blackBoardMsg = await ctx.reply(
        `${isWhiteTurn(moves) ? '*' : ''} (WHITE) User ${whiteUser ? unescape(whiteUser.first_name) : 'waiting...'}`,
        board(status.board.squares, false)
      ).catch(debug)

      const blackActionsMsg = await ctx.reply(
        `${!isWhiteTurn(moves) ? '*' : ''} (BLACK) YOU`,
        actions()
      ).catch(debug)

      if (blackBoardMsg.message_id !== Number(game.board_b) ||
        blackActionsMsg.message_id !== Number(game.actions_b)
      ) {
        await updateGame(game.id, {
          board_b: blackBoardMsg?.message_id,
          actions_b: blackActionsMsg?.message_id,
        })
      }

      ctx.session.board = blackBoardMsg
      ctx.session.actions = blackActionsMsg
    }

    return ctx.answerCbQuery()
  },
]
