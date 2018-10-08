module.exports = () => [
  'text',
  async (ctx) => {
    const gameState = await ctx.db('games')
      .where('id', ctx.session.gameId)
      .first()

    if (!gameState) {
      return true
    }

    const to = Number(gameState.user_w) === ctx.from.id
      ? Number(gameState.user_b)
      : Number(gameState.user_w)

    await ctx.tg.sendMessage(to, `${ctx.from.first_name}
-----------------------------
${ctx.message.text}`)

    return true
  },
]
