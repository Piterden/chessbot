require('dotenv').load()
require('module-alias/register')

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const { gameScene } = require('@/scenes')
const { inlineHandler, loadHandler, joinHandler, newHandler } = require('@/handlers')
const knexConfig = require('@/knex-config')

const { session } = Telegraf
const {
  BOT_NAME, BOT_TOKEN,
} = process.env

const stage = new Stage([gameScene])

const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

bot.context.db = knex(knexConfig)

bot.use(session())
bot.use(stage.middleware())

bot.on(...inlineHandler())
bot.start(...loadHandler())
bot.action(...newHandler())
bot.action(...joinHandler())

bot.startPolling()
