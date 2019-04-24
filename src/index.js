require('dotenv').load()
require('module-alias/register')

const knex = require('knex')
const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const { debug, unescapeUser } = require('@/helpers')
const { gameScene } = require('@/scenes')
const knexConfig = require('@/../knexfile')
const { inlineHandler, loadHandler, joinHandler, newHandler } = require('@/handlers')

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

bot.action(/^join::(\w)::(\d+)/, async (ctx) => {
  debug(ctx.update)
  const userId = Number(ctx.match[2])
  const iAmWhite = () => ctx.match[1] !== 'w'

  if (ctx.from.id === userId) {
    return ctx.answerCbQuery('You can\'t join yourself!')
  }

  const enemy = await ctx.db('users').where('id', userId).first()

  await ctx.db('games').returning('id').insert({
    user_w: !iAmWhite() ? enemy.id : ctx.from.id,
    user_b: !iAmWhite() ? ctx.from.id : enemy.id,
    inline_id: ctx.update.callback_query.inline_message_id,
  }).catch(debug)

  await ctx.editMessageText(
    !iAmWhite()
      ? `Black (top): ${ctx.from.first_name}
White (bottom): ${unescapeUser(enemy).first_name}`
      : `Black (top): ${unescapeUser(enemy).first_name}
White (bottom): ${ctx.from.first_name}`
  )

  return ctx.answerCbQuery()
})

bot.startPolling()
