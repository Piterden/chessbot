require('dotenv').config()
require('module-alias/register')

const fs = require('fs')
const knex = require('knex')
const path = require('path')
const crypto = require('crypto')
const { default: Telegraf, session } = require('telegraf')

const {
  // gamesHandler,
  // startHandler,
  // mainMenuHandler,
  // inlineBackHandler,
  fenMoveHandler,
  inlineLastTurn,
  fenListenHandler,
  inlineJoinHandler,
  inlineMoveHandler,
  inlineQueryHandler,
  // inlineSettingsHandler,
} = require('@/handlers')
const { debug, log, preLog, makeUserLog } = require('@/helpers')
const knexConfig = require('@/../knexfile')

const { BOT_NAME, BOT_TOKEN } = process.env

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

bot.context.db = knex(knexConfig)

bot.use(session({
  property: 'game',
  getSessionKey: (ctx) => ctx.callbackQuery?.inline_message_id ||
    `${ctx.from?.id}:${ctx.chat?.id}:${ctx.message?.message_id || ctx.callbackQuery?.message_id}`,
}))

// bot.command('start', startHandler())
// bot.action(...mainMenuHandler())
// bot.action(...gamesHandler())
bot.hears(...fenListenHandler())
bot.action(...fenMoveHandler())

// bot.action(...inlineBackHandler())
// bot.action(...inlineSettingsHandler())

bot.on('inline_query', inlineQueryHandler())
bot.action(...inlineJoinHandler())
bot.action(...inlineMoveHandler())
bot.action(...inlineLastTurn())

bot.on('chosen_inline_result', async (ctx) => {
  log(
    preLog('BORD', `${makeUserLog(ctx.update.chosen_inline_result.from)}| [${ctx.update.chosen_inline_result.result_id === 2 ? 'black' : 'white'}] {${ctx.update.chosen_inline_result.inline_message_id}}`),
    ctx
  )
})

bot.catch((err) => debug(err))

bot
  .launch(/*{ webhook: {
    domain: 'https://s1067490.srvape.com',
    port: 443,
    secretToken: crypto.randomBytes(64).toString("hex"),
    tlsOptions: {
      key: fs.readFileSync(path.resolve('./certs/YOURPRIVATE.key')),
      cert: fs.readFileSync(path.resolve('./certs/YOURPUBLIC.pem')),
    },
  }}*/)
   .then(() => debug("Webhook bot listening on port 443"))
