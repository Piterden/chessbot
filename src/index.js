require('dotenv').load()

const Telegraf = require('telegraf')
// const Stage = require('telegraf/stage')

const { moveHandler, startHandler } = require('./actions')


const { session } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env

// const stage = new Stage([], { ttl: 120 })

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.use(session())
// bot.use(stage.middleware())

bot.start(...startHandler())
bot.action(...moveHandler())

bot.startPolling()
