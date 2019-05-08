const { debug } = require('@/helpers')

module.exports = () => [
  /^back$/,
  async (ctx) => {
    if (ctx.game && ctx.game.lastBoard) {
      await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
        .catch(debug)
    }
  },
]
