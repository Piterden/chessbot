require('dotenv').config()
require('module-alias/register')

const knex = require('knex')
const { default: Telegraf, session } = require('telegraf')

const {
  // gamesHandler,
  // startHandler,
  inlineLastTurn,
  // mainMenuHandler,
  inlineBackHandler,
  inlineJoinHandler,
  inlineMoveHandler,
  inlineQueryHandler,
  inlineSettingsHandler,
} = require('@/handlers')
const { debug, log, preLog, makeUserLog } = require('@/helpers')
const knexConfig = require('@/../knexfile')
const { pay } = require('@/billing')
const { isPayed } = require('./billing')

const { BOT_NAME, BOT_TOKEN } = process.env

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

bot.context.db = knex(knexConfig)

bot.use(session({
  property: 'game',
  getSessionKey: (ctx) => (ctx.callbackQuery && ctx.callbackQuery.inline_message_id) ||
    (ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`),
}))

// bot.use(async (ctx, next) => {
//   debug(ctx.update)
//   // debug(ctx.game)
//   next(ctx)
//   // if (ctx.chat && ctx.chat.type === 'private') {
//   // }
// })

// bot.command('start', startHandler())

// bot.action(...mainMenuHandler())
// bot.action(...gamesHandler())

bot.on('inline_query', inlineQueryHandler())
// bot.on('chosen_inline_result', async (ctx) => {
//   debug(Object.keys(ctx))
// })

bot.action(...inlineBackHandler())
bot.action(...inlineJoinHandler())
bot.action(...inlineMoveHandler())
bot.action(...inlineSettingsHandler())
bot.action(...inlineLastTurn())

bot.command('pay', async ctx => await isPayed(ctx) ? ctx.reply('payed') : pay(ctx))

bot.on('chosen_inline_result', async (ctx) => {
  log(
    preLog('BORD', `${makeUserLog(ctx.update.chosen_inline_result.from)}| [${ctx.update.chosen_inline_result.result_id === 2 ? 'black' : 'white'}] {${ctx.update.chosen_inline_result.inline_message_id}}`),
    ctx
  )
})

bot.catch((err) => debug(err))

bot.telegram.getUpdates(1, -1).then(() => bot.launch())
