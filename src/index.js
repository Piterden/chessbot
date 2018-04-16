require('dotenv').load()

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const { debug } = require('./helpers')
const { gameScene } = require('./scenes')


const { session } = Telegraf
const {
  BOT_NAME, BOT_TOKEN, DB_CLIENT, DB_HOST, DB_DATABASE, DB_USERNAME,
  DB_PASSWORD, DB_CHARSET,
} = process.env
const COLS = 2

const stage = new Stage([gameScene], { ttl: 120 })

const gameButton = (game) => ({
  text: `${game.user_w} / ${game.user_b ? game.user_b : 'Waiting...'}`,
  callback_data: `join/${game.id}`,
})

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
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

bot.start(async (ctx) => {
  const games = await ctx.db.from('games')
    .whereNull('user_b')
    .orWhere('user_b', ctx.from.id)
    .orWhere('user_w', ctx.from.id)
    .select()

  const inlineKeyboard = games.reduce((acc, game) => {
    if (acc.length === 0 || acc[acc.length - 1].length === COLS) {
      acc.push([gameButton(game)])
    }
    else {
      acc[acc.length - 1].push(gameButton(game))
    }
    return acc
  }, [])

  inlineKeyboard.push([
    { text: 'Create a new game', callback_data: 'new' },
  ])

  ctx.replyWithMarkdown(
    `Hi ${ctx.from.first_name || 'stranger'}, I'm the Chess bot.
${inlineKeyboard.length > 1 ? '\n*Available games:*' : ''}`,
    {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
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

    if (!gameState.user_b && gameState.user_w !== ctx.from.id) {
      await ctx.db('games')
        .where({ id: gameState.id })
        .update({ user_b: ctx.from.id })
    }

    ctx.session.gameId = gameState.id
    try {
      await ctx.scene.enter('game')
    }
    catch (error) {
      debug(error)
    }

    return ctx.answerCbQuery()
  }
)

bot.startPolling()
