require('dotenv').load()

const chess = require('chess')
const Telegraf = require('telegraf')
// const Stage = require('telegraf/stage')

const { debug } = require('./helpers')
const { board, actions } = require('./keyboards')


const { session } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env

// const stage = new Stage([], { ttl: 120 })

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

const byDest = ({ file, rank }) => ({ dest }) => dest.file === file && dest.rank === rank

bot.use(session())
// bot.use(stage.middleware())

bot.start(async (ctx) => {
  debug(ctx.from)
  ctx.session.chess = chess.create({ PGN: true })

  const status = ctx.session.chess.getStatus()

  ctx.session.mode = 'select'
  ctx.session.eaten = { white: [], black: [] }
  ctx.session.moves = []
  ctx.session.selected = null
  ctx.session.whitesTurn = true

  ctx.session.board = await ctx.replyWithMarkdown(
    '*(B)*',
    board(status.board.squares, true)
  )

  ctx.session.actions = await ctx.replyWithMarkdown(
    '*(W)*',
    actions()
  )
})

bot.action(
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

        ctx.editMessageReplyMarkup(board(
          status.board.squares.map((sqr) => {
            const move = moves.find(byDest(sqr))

            return move ? { ...sqr, destination: move } : sqr
          }),
          ctx.session.whitesTurn
        ).reply_markup)

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

        ctx.editMessageReplyMarkup(board(
          status.board.squares,
          ctx.session.whitesTurn
        ).reply_markup)

        break

      default:
    }

    return ctx.answerCbQuery()
  }
)

bot.startPolling()
