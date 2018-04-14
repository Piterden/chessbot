require('dotenv').load()

const knex = require('knex')
// const chess = require('chess')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

// const { debug } = require('./helpers')
const { newRoom, joinRoom, gameScene } = require('./scenes')


const { session } = Telegraf
const {
  BOT_NAME, BOT_TOKEN, DB_CLIENT, DB_DATABASE, DB_USERNAME, DB_PASSWORD,
  DB_CHARSET,
} = process.env
// const COLS = 2

const stage = new Stage([newRoom, joinRoom, gameScene], { ttl: 120 })

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.context.db = knex({
  client: DB_CLIENT,
  connection: {
    host: '127.0.0.1',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    charset: DB_CHARSET,
  },
})

bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => {
  // const games = await ctx.db.from('games').whereNull('user_b')

  ctx.replyWithMarkdown(
    `Hi ${ctx.from.first_name || 'stranger'}, I'm the Chess bot.

*Available games:*`,
    {
      reply_markup: {
        inline_keyboard: [
          // ...games.reduce((acc, game) => {
          //   if (acc.length === 0 || acc[acc.length - 1].length === COLS) {
          //     acc.push([{ text: game.white, callback_data: `join/${game.id}` }])
          //   }
          //   else {
          //     acc[acc.length - 1].push({ text: game.white, callback_data: `join/${game.id}` })
          //   }
          //   return acc
          // }, []),
          [
            { text: 'Create a new game', callback_data: 'new' },
          ],
        ],
      },
    }
  )
})

bot.action(
  /^new$/,
  async (ctx) => {
    const gameId = await ctx.db('games')
      .insert({ user_w: ctx.from.id })

    ctx.session.gameId = gameId
    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  }
)

bot.action(
  /^join\/(\d+)$/,
  async (ctx) => {
    const gameState = await ctx.db('games')
      .where({ id: Number(ctx.match[1]) })
      .first()

    if (gameState.user_w === ctx.from.id) {
      return ctx.answerCbQuery()
    }

    ctx.session.gameId = gameState.id

    await ctx.db('games')
      .where({ id: ctx.session.gameId })
      .update({ user_b: ctx.from.id })

    ctx.scene.enter('game')

    return ctx.answerCbQuery()
  }
)

bot.startPolling()
