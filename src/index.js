require('dotenv').load()

const chess = require('chess')
const Telegraf = require('telegraf')
// const Stage = require('telegraf/stage')

const { game } = require('./actions')
const { debug } = require('./helpers')
const { board, actions } = require('./keyboards')


const { session } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env

// const stage = new Stage([], { ttl: 120 })

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

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

  ctx.session.board = await ctx.reply('(B)', board(status.board.squares, true))
  ctx.session.actions = await ctx.reply('(W)', actions())
})

bot.action(...game())

bot.startPolling()
