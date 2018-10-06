module.exports = () => [
  'message',
  async (ctx) => {
    const games = await ctx.db('games')
      .orWhere({ user_b: ctx.from.id, user_w: ctx.from.id })
      .select()

    if (games.length === 0) {
      return true
    }

    const gameState = games[0]
    const to = gameState.user_w === ctx.chat.id
      ? gameState.user_b
      : gameState.user_w

    ctx.tg.sendMessage(to, `Message from ${ctx.from.first_name}

${ctx.message.text}`)

    return true
  },
]
