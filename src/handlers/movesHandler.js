import chess from 'chess'

import {
  debug,
  isReady,
  deepDiff,
  topMessage,
  isBlackTurn,
  isWhiteTurn,
  isWhitePlayer,
  isBlackPlayer,
  bottomMessage,
  statusMessage,
} from '../helpers.js'
import { board, actions } from '../keyboards/index.js'
import { getGame, addMove, getMoves, getGameWithMoves } from '../database.js'

export default () => [
  /^([a-h])([1-8])$/,
  async (ctx) => {
    const game = await getGameWithMoves(ctx.session.gameId)

    if (!isReady(game)) {
      return ctx.answerCbQuery('Wait for second player...').catch(debug)
    }

    if (
      (isWhiteTurn(game.moves) && isBlackPlayer(ctx, game)) ||
      (isBlackTurn(game.moves) && isWhitePlayer(ctx, game))
    ) {
      return ctx.answerCbQuery('Not your turn! Please wait...').catch(debug)
    }

    const gameClient = chess.create({ PGN: true })

    game.moves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    let status = gameClient.getStatus()
    const [, letter, digit] = ctx.match
    const square = status.board.squares
      .find(({ file, rank }) => file === letter && rank === Number(digit))

    if (ctx.session.selected === null) {
      if (
        !square || !square.piece ||
        (square.piece.side.name === 'black' && isWhiteTurn(game.moves)) ||
        (square.piece.side.name === 'white' && isBlackTurn(game.moves))
      ) {
        return ctx.answerCbQuery('Please, move your pieces!').catch(debug)
      }

      const validMoves = Object.keys(status.notatedMoves)
        .filter((key) => status.notatedMoves[key].src === square)
        .map((key) => ({ ...status.notatedMoves[key], key }))

      await ctx.editMessageReplyMarkup(board(
        status.board.squares.map((sqr) => {
          const move = validMoves
            .find((({ file, rank }) => ({ dest }) => dest.file === file &&
              dest.rank === rank)(sqr))

          return move ? { ...sqr, destination: move } : sqr
        }),
        isWhiteTurn(game.moves),
      ).reply_markup).catch(debug)

      ctx.session.moves = validMoves
      ctx.session.selected = square

      return ctx.answerCbQuery(`${square.piece.type} ${square.file}${square.rank}`)
        .catch(debug)
    }

    if (ctx.session.selected) {
      if (square === ctx.session.selected) {
        return ctx.answerCbQuery().catch(debug)
      }
      const moving = ctx.session.moves
        .find(({ dest: { file, rank } }) => file === square.file && rank === square.rank)

      if (moving) {
        try {
          gameClient.move(moving.key)
        } catch (error) {
          debug(error)
        }

        status = gameClient.getStatus()
        await addMove(game.id, moving.key).catch(debug)
        game.moves.push({ entry: moving.key })

        ctx.session.moves = null
        ctx.session.selected = null

        if (ctx.session.board) {
          await ctx.tg.editMessageText(
            game.user_w,
            game.board_w,
            undefined,
            topMessage(game.moves, game, true) + statusMessage(status),
            board(status.board.squares, true),
          ).catch(debug)

          await ctx.tg.editMessageText(
            game.user_b,
            game.board_b,
            undefined,
            topMessage(game.moves, game, false) + statusMessage(status),
            board(status.board.squares, false),
          ).catch(debug)
        }

        if (ctx.session.actions) {
          const oldText = ctx.session.actions.text
          const newText = bottomMessage(game.moves, game, true)
          const oldMarkup = ctx.session.actions.reply_markup
          const newMarkup = actions()

          if (oldText !== newText || deepDiff(oldMarkup, newMarkup)) {
            await ctx.tg.editMessageText(
              game.user_w,
              game.actions_w,
              undefined,
              bottomMessage(game.moves, game, true),
              actions(),
            ).catch(debug)
          }

          await ctx.tg.editMessageText(
            game.user_b,
            game.actions_b,
            undefined,
            bottomMessage(game.moves, game, false),
            actions(),
          ).catch(debug)
        }
      }
    }

    return ctx.answerCbQuery().catch(debug)
  },
]
