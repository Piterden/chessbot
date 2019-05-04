const { debug } = require('@/helpers')

module.exports = () => [
  /^back$/,
  async (ctx) => {
    await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
      .catch(debug)
  },
]
