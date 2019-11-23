require('dotenv').config()
require('module-alias/register')

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const { session } = Telegraf
const {
  newHandler,
  joinHandler,
  loadHandler,
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
const { gameScene } = require('@/scenes')
const knexConfig = require('@/../knexfile')

const { BOT_NAME, BOT_TOKEN } = process.env

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })
const stage = new Stage([gameScene])

bot.context.db = knex(knexConfig)

bot.use(stage.middleware())

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

bot.start(...loadHandler())
bot.action(...newHandler())
bot.action(...joinHandler())
bot.action(...gamesHandler())
bot.action(...mainMenuHandler())

bot.on('inline_query', inlineQueryHandler())
bot.action(...inlineBackHandler())
bot.action(...inlineJoinHandler())
bot.action(...inlineMoveHandler())
bot.action(...inlineSettingsHandler())

// bot.on('chosen_inline_result', async (ctx) => {
//   debug(ctx.update)
// })

bot.startPolling()
