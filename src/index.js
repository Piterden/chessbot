require('dotenv').load()
require('module-alias/register')

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const { gameScene } = require('@/scenes')
const { loadHandler, joinHandler, newHandler } = require('@/handlers')


const { session } = Telegraf
const {
  BOT_NAME, BOT_TOKEN,
  DB_CLIENT, DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_CHARSET,
} = process.env

const stage = new Stage([gameScene])

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

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

bot.use(session())
bot.use(stage.middleware())

bot.start(...loadHandler())
bot.action(...newHandler())
bot.action(...joinHandler())

bot.startPolling()
