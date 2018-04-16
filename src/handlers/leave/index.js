module.exports = () => [
  async (ctx) => {
    await ctx.deleteMessage(ctx.session.board)
    await ctx.deleteMessage(ctx.session.actions)

    return ctx.answerCbQuery()
  },
]
