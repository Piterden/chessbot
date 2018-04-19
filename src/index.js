require('dotenv').load()

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const { debug } = require('./helpers')
const { gameScene } = require('./scenes')
const { loadHandler } = require('./handlers')


const { session } = Telegraf
const {
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

bot.use(session())
bot.use(stage.middleware())

bot.start(...loadHandler())

bot.action(
  /^new$/,
  async (ctx) => {
    const [gameId] = await ctx.db('games')
      .returning('id')
      .insert({ user_w: ctx.from.id })

    if (ctx.session.listMessage) {
      try {
        await ctx.deleteMessage(ctx.session.listMessage.message_id)
      }
      catch (error) {
        debug(error)
      }
      ctx.session.listMessage = null
    }

    ctx.session.gameId = gameId
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  }
)

bot.action(
  /^join\/(\d+)$/,
  async (ctx) => {
    const games = await ctx.db('games')
      .where('id', Number(ctx.match[1]))
      .select()

    const gameState = games[0]

    if (!gameState.user_b && Number(gameState.user_w) !== ctx.from.id) {
      await ctx.db('games')
        .where('id', gameState.id)
        .update({ user_b: ctx.from.id })
    }

    if (ctx.session.listMessage) {
      try {
        await ctx.deleteMessage(ctx.session.listMessage.message_id)
      }
      catch (error) {
        debug(error)
      }
      ctx.session.listMessage = null
    }

    ctx.session.gameId = gameState.id
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  }
)

bot.startPolling()
