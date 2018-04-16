const chess = require('chess')

const { debug } = require('../../helpers')
const { board, actions } = require('../../keyboards')


const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `
${isCheck ? '|CHECK|' : ''}
${isCheckmate ? '|CHECKMATE|' : ''}
${isRepetition ? '|REPETITION|' : ''}`

const topMessage = (ctx, status) => `
${ctx.session.whitesTurn ? '(BLACK)' : '(WHITE)'}${statusMessage(status)}`

const bottomMessage = (ctx, status) => `
${ctx.session.whitesTurn ? '(WHITE)' : '(BLACK)'}${statusMessage(status)}`

const isReady = (game) => !!(
  game.board_w && game.board_b
  && game.actions_w && game.actions_b
  && game.user_w && game.user_b
)

// eslint-disable-next-line no-magic-numbers
const isWhiteTurn = (moves) => !(moves.length % 2)

module.exports = () => [
  /^([a-h])([1-8])$/,
  async (ctx) => {
    const gameState = await ctx.db('games')
      .where({ id: ctx.session.gameId })
      .first()

    if (!isReady(gameState)) {
      return ctx.answerCbQuery('Waiting for 2 players...')
    }

    const movesState = await ctx.db('moves')
      .where({ game_id: ctx.session.gameId })
      .orderBy('created_at', 'asc')
      .select()

    if (
      (isWhiteTurn(gameState) && ctx.from.id === gameState.user_b)
      || (!isWhiteTurn(gameState) && ctx.from.id === gameState.user_w)
    ) {
      return ctx.answerCbQuery('Not your turn! Please wait...')
    }

    const gameClient = chess.create({ PGN: true })

    movesState.forEach(({ move }) => {
      gameClient.move(move)
    })

    let moving
    let moves = []
    let status = gameClient.getStatus()
    const square = status.board.squares
      .find(({ file, rank }) => file === ctx.match[1] && rank === Number(ctx.match[2]))

    // debug(status)
    switch (ctx.session.mode) {
      case 'select':
        if (
          !square || !square.piece
          || (square.piece.side.name === 'black' && isWhiteTurn(movesState))
          || (square.piece.side.name === 'white' && !isWhiteTurn(movesState))
        ) {
          return ctx.answerCbQuery()
        }

        moves = Object.keys(status.notatedMoves)
          .filter((key) => status.notatedMoves[key].src === square)
          .map((key) => ({ ...status.notatedMoves[key], key }))

        try {
          ctx.editMessageReplyMarkup(board(
            status.board.squares.map((sqr) => {
              const move = moves
                .find((({ file, rank }) => ({ dest }) => dest.file === file
                  && dest.rank === rank)(sqr))

              return move ? { ...sqr, destination: move } : sqr
            }),
            isWhiteTurn(movesState)
          ))
        }
        catch (error) {
          debug(error)
        }

        ctx.session.mode = 'move'
        ctx.session.moves = moves
        ctx.session.selected = square

        break

      case 'move':
        moving = ctx.session.moves.find((move) => move.dest === square)

        if (moving) {
          if (moving.dest.piece) {
            ctx.session.eaten[moving.dest.piece.side.name]
              .push(moving.dest.piece)
          }

          ctx.session.chess.move(moving.key)
          status = ctx.session.chess.getStatus()

          await ctx.db('moves').insert({
            game_id: ctx.session.gameId,
            move: moving.key,
          })
        }

        ctx.session.mode = 'select'
        ctx.session.moves = null
        ctx.session.selected = null

        try {
          ctx.tg.editMessageText(
            ctx.chat.id,
            gameState.board_w,
            undefined,
            topMessage(ctx, status),
            board(status.board.squares, true)
          )

          ctx.tg.editMessageText(
            ctx.chat.id,
            gameState.actions_w,
            undefined,
            bottomMessage(ctx, status),
            actions()
          )

          ctx.tg.editMessageText(
            ctx.chat.id,
            gameState.board_b,
            undefined,
            bottomMessage(ctx, status),
            board(status.board.squares, false)
          )

          ctx.tg.editMessageText(
            ctx.chat.id,
            gameState.actions_b,
            undefined,
            topMessage(ctx, status),
            actions()
          )
        }
        catch (error) {
          debug(error)
        }

        break

      default:
    }

    return ctx.answerCbQuery()
  },
]
