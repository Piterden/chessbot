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
  inlineJoinHandler,
  inlineMoveHandler,
  inlineQueryHandler,
} = require('@/handlers')

const { session } = Telegraf
const {
  BOT_NAME, BOT_TOKEN,
} = process.env

const stage = new Stage([gameScene])

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

bot.context.db = knex(knexConfig)

bot.use(session())
bot.use(stage.middleware())

bot.start(...loadHandler())
bot.action(...newHandler())
bot.action(...joinHandler())

bot.action(...inlineJoinHandler())
bot.action(...inlineMoveHandler())
bot.on('inline_query', inlineQueryHandler())

bot.startPolling()
