const {
  debug,
  getGame,
  isWhiteUser,
  isBlackUser,
} = require('@/helpers')

module.exports = () => [
  /^back$/,
  async (ctx) => {
    const gameEntry = await getGame(ctx)

    if (typeof gameEntry === 'boolean') {
      return gameEntry
    }

    if (!isBlackUser(gameEntry, ctx) && !isWhiteUser(gameEntry, ctx)) {
      return ctx.answerCbQuery('Sorry, this game is busy. Try to make a new one.')
    }

    if (ctx.game && ctx.game.lastBoard) {
      await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
        .catch(debug)
    }
  },
]
