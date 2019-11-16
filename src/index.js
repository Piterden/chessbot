require('dotenv').config()
require('module-alias/register')

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const { gameScene } = require('./scenes')
const { loadHandler, joinHandler, newHandler } = require('./handlers')


const { session } = Telegraf
const {
  gamesHandler,
  startHandler,
  mainMenuHandler,
  inlineBackHandler,
  inlineJoinHandler,
  inlineMoveHandler,
  inlineQueryHandler,
  inlineSettingsHandler,
} = require('@/handlers')
const { debug } = require('@/helpers')

const knexConfig = require('@/../knexfile')
  BOT_NAME, BOT_TOKEN, DB_CLIENT, DB_HOST, DB_DATABASE, DB_USERNAME,
  DB_PASSWORD, DB_CHARSET,
} = process.env

const stage = new Stage([gameScene], { ttl: 120 })

const bot = new Telegraf(BOT_TOKEN, {
  telegram: {
    webhookReply: false,
  },
  username: BOT_NAME,
})

bot.context.db = knex({
  client: DB_CLIENT,
  connection: {
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    charset: DB_CHARSET,
  },
})

const { session } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env
bot.use(stage.middleware())

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

bot.context.db = knex(knexConfig)

bot.use(session({
  property: 'game',
  getSessionKey: (ctx) => (ctx.callbackQuery && ctx.callbackQuery.inline_message_id) ||
    (ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`),
}))

bot.use(async (ctx, next) => {
  debug(ctx.update)
  // debug(ctx.game)
  next(ctx)
  // if (ctx.chat && ctx.chat.type === 'private') {
  // }
})

bot.command('start', startHandler())

bot.action(...mainMenuHandler())
bot.action(...gamesHandler())

bot.on('inline_query', inlineQueryHandler())
// bot.on('chosen_inline_result', async (ctx) => {
//   debug(Object.keys(ctx))
// })

bot.action(...inlineBackHandler())
bot.action(...inlineJoinHandler())
bot.action(...inlineMoveHandler())
bot.action(...inlineSettingsHandler())

// bot.on('chosen_inline_result', async (ctx) => {
//   debug(ctx.update)
// })
bot.start(...loadHandler())
bot.action(...newHandler())
bot.action(...joinHandler())

bot.startPolling()
