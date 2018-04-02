const chess = require('chess')

const { debug } = require('../helpers')
const { board, actions } = require('../keyboards')


const statusMessage = (status) => `
${status.isCheck ? '|CHECK|' : ''}
${status.isCheckmate ? '|CHECKMATE|' : ''}
${status.isRepetition ? '|REPETITION|' : ''}`

const topMessage = (ctx, status) => `
${ctx.session.whitesTurn ? '(B)' : '(W)'}${statusMessage(status)}`

const bottomMessage = (ctx, status) => `
${ctx.session.whitesTurn ? '(W)' : '(B)'}${statusMessage(status)}`

const startHandler = () => [
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

const moveHandler = () => [
  /^([a-h])([1-8])$/,
  async (ctx) => {
    if (!ctx.session.chess) return true

    let status = ctx.session.chess.getStatus()
    const square = status.board.squares
      .find(({ file, rank }) => file === ctx.match[1] && rank === Number(ctx.match[2]))
    let moves = []
    let moving

    // debug(status)
    switch (ctx.session.mode) {
      case 'select':
        if (
          !square || !square.piece
          || (square.piece.side.name === 'black' && ctx.session.whitesTurn)
          || (square.piece.side.name === 'white' && !ctx.session.whitesTurn)
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
            ctx.session.whitesTurn
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
          ctx.session.whitesTurn = !ctx.session.whitesTurn
        }

        ctx.session.mode = 'select'
        ctx.session.moves = null
        ctx.session.selected = null

        ctx.tg.editMessageText(
          ctx.chat.id,
          ctx.session.board.message_id,
          undefined,
          topMessage(ctx, status),
          board(status.board.squares, ctx.session.whitesTurn)
        )

        ctx.tg.editMessageText(
          ctx.chat.id,
          ctx.session.actions.message_id,
          undefined,
          bottomMessage(ctx, status),
          actions()
        )

        break

      default:
    }

    return ctx.answerCbQuery()
  },
]

module.exports = {
  moveHandler,
  startHandler,
}
