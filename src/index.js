require('dotenv').load()

const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')
const lobbyController = require('lobby-controller')

// const { debug } = require('./helpers')
const { newRoom, joinRoom } = require('./scenes')


const { session } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env

const stage = new Stage([newRoom, joinRoom], { ttl: 120 })

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.use(session())
bot.use(stage.middleware())
bot.context.lobbyController = lobbyController()

bot.start(async (ctx) => {
  // debug(ctx.contextState)
  ctx.reply(
    `Hi ${ctx.from.first_name || 'stranger'}, I'm the Chess bot.`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Join the game', callback_data: 'scene/join' },
          { text: 'Create a new game', callback_data: 'scene/new' },
        ]],
      },
    }
  )
})

bot.action(
  /^scene\/(\w+)$/,
  async (ctx) => {
    ctx.scene.enter(ctx.match[1])
  }
)

bot.startPolling()
