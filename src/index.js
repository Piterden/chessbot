import dotenv from 'dotenv'
import Telegraf from 'telegraf'
import Stage from 'telegraf/stage.js'

import { debug } from './helpers.js'
import { addOrUpdateUser } from './database.js'
import { gameScene, lobbyScene } from './scenes/index.js'
import { newHandler, joinHandler, startHandler } from './handlers/index.js'

dotenv.config()

const { session } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env

const stage = new Stage([gameScene, lobbyScene])
const bot = new Telegraf(BOT_TOKEN, { username: BOT_NAME })

bot.use(session({
  property: 'session',
  getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`,
}))
bot.use(stage.middleware())
bot.use((ctx, next) => {
  addOrUpdateUser(ctx.from)
  next()
})

bot.start(...startHandler())

bot.launch().catch(debug)
