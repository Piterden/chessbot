const chess = require('chess')

const { debug } = require('@/helpers')
const { board, actions } = require('@/keyboards')

const isWhiteTurn = (moves) => !(moves.length % 2)

const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `
${isCheck ? '|CHECK|' : ''}
${isCheckmate ? '|CHECKMATE|' : ''}
${isRepetition ? '|REPETITION|' : ''}`

const topMessage = (moves, game, isWhiteSide) => isWhiteSide
  ? `${isWhiteTurn(moves) ? '*' : ''} (BLACK) User ${game.blacks_id || 'waiting...'}`
  : `${!isWhiteTurn(moves) ? '*' : ''} (WHITE) ${game.whites_id}`

const bottomMessage = (moves, game, isWhiteSide) => isWhiteSide
  ? `${!isWhiteTurn(moves) ? '*' : ''} (WHITE) YOU`
  : `${isWhiteTurn(moves) ? '*' : ''} (BLACK) YOU`

const isReady = (game) => !!(
  game.board_w && game.board_b &&
  game.actions_w && game.actions_b &&
  game.whites_id && game.blacks_id
)

module.exports = () => [
  /^([a-h])([1-8])$/,
  async (ctx) => {
    const gameState = await ctx.db('games')
      .where('id', ctx.session.gameId)
      .first()

    if (!isReady(gameState)) {
      return ctx.answerCbQuery('Wait for second player...')
    }

    const movesState = await ctx.db('moves')
      .where('game_id', ctx.session.gameId)
      .orderBy('created_at', 'asc')
      .select()

    if (
      (isWhiteTurn(movesState) && ctx.from.id === Number(gameState.blacks_id)) ||
      (!isWhiteTurn(movesState) && ctx.from.id === Number(gameState.whites_id))
    ) {
      return ctx.answerCbQuery('Not your turn! Please wait...')
    }

    const gameClient = chess.create({ PGN: true })

    movesState.forEach(({ move }) => {
      try {
        gameClient.move(move)
      } catch (error) {
        debug(error)
      }
    })

    let moving
    let moves = []
    let status = gameClient.getStatus()
    const square = status.board.squares
      .find(({ file, rank }) => file === ctx.match[1] && rank === Number(ctx.match[2]))

    switch (ctx.session.mode) {
      case 'select':
        if (
          !square || !square.piece ||
          (square.piece.side.name === 'black' && isWhiteTurn(movesState)) ||
          (square.piece.side.name === 'white' && !isWhiteTurn(movesState))
        ) {
          return ctx.answerCbQuery('Please, move your pieces!')
        }

        moves = Object.keys(status.notatedMoves)
          .filter((key) => status.notatedMoves[key].src === square)
          .map((key) => ({ ...status.notatedMoves[key], key }))

        try {
          await ctx.editMessageReplyMarkup(board(
            status.board.squares.map((sqr) => {
              const move = moves
                .find((({ file, rank }) => ({ dest }) => dest.file === file &&
                  dest.rank === rank)(sqr))

              return move ? { ...sqr, destination: move } : sqr
            }),
            isWhiteTurn(movesState)
          ).reply_markup)
        } catch (error) {
          debug(error)
        }

        ctx.session.mode = 'move'
        ctx.session.moves = moves
        ctx.session.selected = square

        break

      case 'move':
        moving = ctx.session.moves
          .find(({ dest: { file, rank } }) => file === square.file && rank === square.rank)

        if (moving && !movesState.find((move) => move.move === moving.key)) {
          try {
            gameClient.move(moving.key)
          } catch (error) {
            debug(error)
          }

          status = gameClient.getStatus()

          try {
            await ctx.db('moves').insert({
              game_id: ctx.session.gameId,
              move: moving.key,
            })
          } catch (error) {
            debug(error)
          }
        }

        ctx.session.mode = 'select'
        ctx.session.moves = null
        ctx.session.selected = null

        if (ctx.session.board) {
          try {
            await ctx.tg.editMessageText(
              gameState.whites_id,
              gameState.board_w,
              undefined,
              topMessage(movesState, gameState, true) + statusMessage(status),
              board(status.board.squares, true)
            )
          } catch (error) {
            debug(error)
          }

          try {
            await ctx.tg.editMessageText(
              gameState.blacks_id,
              gameState.board_b,
              undefined,
              topMessage(movesState, gameState, false) + statusMessage(status),
              board(status.board.squares, false)
            )
          } catch (error) {
            debug(error)
          }
        }

        if (ctx.session.actions) {
          try {
            await ctx.tg.editMessageText(
              gameState.whites_id,
              gameState.actions_w,
              undefined,
              bottomMessage(movesState, gameState, true),
              actions()
            )
          } catch (error) {
            debug(error)
          }

          try {
            await ctx.tg.editMessageText(
              gameState.blacks_id,
              gameState.actions_b,
              undefined,
              bottomMessage(movesState, gameState, false),
              actions()
            )
          } catch (error) {
            debug(error)
          }
        }

        break

      default:
    }

    return ctx.answerCbQuery()
  },
]
