require('dotenv').config()
require('module-alias/register')

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const { gameScene } = require('@/scenes')
const knexConfig = require('@/../knexfile')
const {
  newHandler,
  joinHandler,
  loadHandler,
  inlineHandler,
  inlineJoinHandler,
  inlineMoveHandler,
} = require('@/handlers')

const { session } = Telegraf
const {
  BOT_NAME, BOT_TOKEN,
} = process.env

const stage = new Stage([gameScene])

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

bot.context.db = knex(knexConfig)

bot.use(session({
  getSessionKey: (ctx) => {
    const key = ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`

    if (!key) {
      return ctx.from && ctx.callback_query &&
        `${ctx.from.id}:${ctx.callback_query.chat_instance}`
    }
    return key
  },
}))
bot.use(stage.middleware())

bot.on(...inlineHandler())
bot.start(...loadHandler())
bot.action(...newHandler())
bot.action(...joinHandler())
bot.action(...inlineJoinHandler())
bot.action(...inlineMoveHandler())

bot.startPolling()
