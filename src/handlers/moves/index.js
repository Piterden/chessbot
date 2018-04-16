const chess = require('chess')

const { debug } = require('../../helpers')
const { board, actions } = require('../../keyboards')


const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `
${isCheck ? '|CHECK|' : ''}
${isCheckmate ? '|CHECKMATE|' : ''}
${isRepetition ? '|REPETITION|' : ''}`

const topMessage = (status, isWhiteSide) => `
${isWhiteSide ? '(BLACK)' : '(WHITE)'}${statusMessage(status)}`

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
      (isWhiteTurn(movesState) && ctx.from.id === gameState.user_b)
      || (!isWhiteTurn(movesState) && ctx.from.id === gameState.user_w)
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
          await ctx.editMessageReplyMarkup(board(
            status.board.squares.map((sqr) => {
              const move = moves
                .find((({ file, rank }) => ({ dest }) => dest.file === file
                  && dest.rank === rank)(sqr))

              return move ? { ...sqr, destination: move } : sqr
            }),
            isWhiteTurn(movesState)
          ).reply_markup)
        }
        catch (error) {
          debug(error)
        }

        ctx.session.mode = 'move'
        ctx.session.moves = moves
        ctx.session.selected = square

        break

      case 'move':
        moving = ctx.session.moves.find(({ dest: { file, rank } }) => file === square.file
          && rank === square.rank)

        if (moving) {
          if (moving.dest.piece) {
            ctx.session.eaten[moving.dest.piece.side.name]
              .push(moving.dest.piece)
          }

          gameClient.move(moving.key)
          status = gameClient.getStatus()

          await ctx.db('moves').insert({
            game_id: ctx.session.gameId,
            move: moving.key,
          })
        }

        ctx.session.mode = 'select'
        ctx.session.moves = null
        ctx.session.selected = null

        try {
          await ctx.tg.editMessageText(
            gameState.chat_w,
            gameState.board_w,
            undefined,
            topMessage(status, true),
            board(status.board.squares, true)
          )
        }
        catch (error) {
          debug(error)
        }

        try {
          await ctx.tg.editMessageText(
            gameState.chat_b,
            gameState.board_b,
            undefined,
            topMessage(status, false),
            board(status.board.squares, false)
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
