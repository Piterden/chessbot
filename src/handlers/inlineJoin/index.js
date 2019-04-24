// const chess = require('chess')

const { board } = require('@/keyboards')
const { debug, unescapeUser } = require('@/helpers')

module.exports = () => [
  /^join::(\w)::(\d+)/, async (ctx) => {
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
  White (bottom): ${ctx.from.first_name}`,
      board()
    )

    return ctx.answerCbQuery()
  },
]
