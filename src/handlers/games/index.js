const { debug } = require('@/helpers')

module.exports = () => [
  'games',
  async (ctx) => {
    let user = await ctx.db('users').where('id', ctx.from.id).first()
      .catch(debug)

    if (!user) {
      await ctx.db('users').insert(ctx.from).catch(debug)
      user = await ctx.db('users').where('id', ctx.from.id).first()
        .catch(debug)
    }

    const games = await ctx.db('games')
      .where('whites_id', user.id)
      .orWhere('blacks_id', user.id)
      .orderBy('created_at', 'asc')
      .select()
      .catch(debug)

    let ids = games.reduce(
      // eslint-disable-next-line camelcase
      (acc, { blacks_id, whites_id }) => {
        if (!acc.includes(blacks_id)) {
          acc.push(blacks_id)
        }
        if (!acc.includes(whites_id)) {
          acc.push(whites_id)
        }
        return acc
      },
      []
    ).filter((id) => id !== ctx.from.id)

    let enemies = await ctx.db('users').whereIn('id', ids).select()
      .catch(debug)

    enemies = enemies.reduce((acc, { id, ...props }) => {
      acc[id] = props
      return acc
    }, {})

    ctx.editMessageReplyMarkup({ inline_keyboard: [
      ...await Promise.all(games.map(async (game) => {
        const whites = game.whites_id === ctx.from.id
          ? ctx.from.first_name
          : enemies[game.whites_id].first_name
        const blacks = game.blacks_id === ctx.from.id
          ? ctx.from.first_name
          : enemies[game.blacks_id].first_name
        const time = game.created_at.toUTCString()
          .replace(/^\w{3}, /, '')
          .replace(/:\d{2} GMT$/, '')
        const movesLength = await ctx.db('moves')
          .where('game_id', game.id)
          .count()

        return [{
          text: `${time} || ${whites} vs ${blacks} || ${movesLength[0]['count(*)']} moves`,
          switch_inline_query: `${game.whites_id}::${game.blacks_id}::${game.id}`,
        }]
      })),
      [{
        text: '⬅️ Back to menu',
        callback_data: 'main_menu',
      }],
    ] })
  },
]
