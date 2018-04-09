// const Stage = require('telegraf/stage')
// const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')

// const { debug } = require('../../helpers')


module.exports = new Scene('new')
  .enter(async (ctx) => {
    ctx.session.lobbies = ctx.session.lobbies || []

    await ctx.reply('Select the side', {
      reply_markup: {
        inline_keyboard: [[
          { text: 'White', callback_data: 'select/white' },
          { text: 'Black', callback_data: 'select/black' },
        ]],
      },
    })

    return ctx.answerCbQuery()
  })

  .action(
    /^select\/(\w+)/,
    async (ctx) => {
      ctx.lobbyController.addLobbyType({
        type: `${ctx.session.lobbies.length + 1}-${ctx.from.id}`,
        minUsers: 2,
        maxUsers: 2,
      })

      // ctx.from.side = ctx.match[1]

      ctx.session.lobbies.push(ctx.lobbyController.join(
        `${ctx.session.lobbies.length + 1}-${ctx.from.id}`,
        ctx.from
      ))

      ctx.answerCbQuery('New game was created!')

      return ctx.scene.enter('join')
    }
  )
