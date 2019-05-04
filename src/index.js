require('dotenv').config()
require('module-alias/register')

const knex = require('knex')
const Telegraf = require('telegraf')

const knexConfig = require('@/../knexfile')
const {
  inlineBackHandler,
  inlineJoinHandler,
  inlineMoveHandler,
  inlineQueryHandler,
  inlineSettingsHandler,
} = require('@/handlers')
const { debug } = require('@/helpers')

const { session } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

bot.context.db = knex(knexConfig)

bot.use(session({
  property: 'game',
  getSessionKey: (ctx) => (ctx.callbackQuery && ctx.callbackQuery.inline_message_id) ||
    (ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`),
}))

bot.use(async (ctx, next) => {
  debug(ctx.update)
  debug(ctx.game)
  next(ctx)
})

bot.action(...inlineBackHandler())
bot.action(...inlineJoinHandler())
bot.action(...inlineMoveHandler())
bot.action(...inlineSettingsHandler())
bot.on('inline_query', inlineQueryHandler())

bot.startPolling()
