const { mainMenu } = require('@/helpers')

module.exports = () => [
  'main_menu',
  async (ctx) => {
    await ctx.editMessageReplyMarkup({ inline_keyboard: mainMenu })
    return ctx.answerCbQuery()
  },
]
