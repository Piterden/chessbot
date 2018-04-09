// const Stage = require('telegraf/stage')
// const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')


module.exports = new Scene('join')
  .enter(async (ctx) => {
    ctx.reply(
      ctx.lobbyController
        .getAll()
        .map((lobby) => `/${lobby.type} ${lobby.users[0] && lobby.users[0].side}`)
        .join('\n') || 'Not found('

    )

    return ctx.answerCbQuery()
  })
