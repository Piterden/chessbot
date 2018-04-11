require('dotenv').load()

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

// const { debug } = require('./helpers')
const { newRoom, joinRoom } = require('./scenes')


const { session } = Telegraf
const { BOT_NAME, BOT_TOKEN, DB_CLIENT, DB_DATABASE, DB_USERNAME, DB_PASSWORD,
  DB_CHARSET } = process.env
const COLS = 2

const db = knex({
  client: DB_CLIENT,
  connection: {
    host: '127.0.0.1',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    charset: DB_CHARSET,
  },
})

const stage = new Stage([newRoom, joinRoom], { ttl: 120 })

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => {
  // debug(ctx.contextState)
  const games = await db.from('games').select('*').where('black', '0')

  ctx.reply(
    `Hi ${ctx.from.first_name || 'stranger'}, I'm the Chess bot.

Available games:`,
    {
      reply_markup: {
        inline_keyboard: [
          ...games.reduce((acc, game, idx) => {
            if (acc.length === 0 || acc[acc.length - 1].length === COLS) {
              acc.push([{ text: game.white, callback_data: `join/${game.id}` }])
            }
            else {
              acc[acc.length - 1].push({ text: game.white, callback_data: `join/${game.id}` })
            }
            return acc
          }, []),
          [
            { text: 'Create a new game', callback_data: 'new' },
          ],
        ],
      },
    }
  )
})

bot.action(
  /^scene\/(\w+)$/,
  async (ctx) => {
    ctx.scene.enter(ctx.match[1])
  }
)

bot.startPolling()
