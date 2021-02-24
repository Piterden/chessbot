const chess = require('chess')

const { board, actions } = require('@/keyboards')
const { debug, preLog, log, makeUserLog } = require('@/helpers')

module.exports = () => [
  /^join::([wb])::(\d+)/,
  async (ctx) => {
    if (ctx.game.joined) {
      return ctx.answerCbQuery('You are already join the game')
    }
    const enemyId = Number(ctx.match[2])
    const iAmWhite = ctx.match[1] !== 'w'

    if (ctx.from.id === enemyId) {
      return ctx.answerCbQuery('You can\'t join yourself!')
    }

    let user = await ctx.db('users')
      .where({ id: ctx.from.id })
      .first()
      .catch(debug)

    if (!user) {
      await ctx.db('users').insert(ctx.from).catch(debug)
      user = await ctx.db('users').where('id', ctx.from.id).first().catch(debug)
    }

    const enemy = await ctx.db('users').where('id', enemyId).first().catch(debug)
    const whites = iAmWhite ? user : enemy
    const blacks = iAmWhite ? enemy : user

    await ctx.db('games').insert({
      whites_id: whites.id,
      blacks_id: blacks.id,
      inline_id: ctx.callbackQuery.inline_message_id,
      config: JSON.stringify({ rotation: 'dynamic' }),
    }).catch(debug)

    ctx.game.joined = true

    const game = await ctx.db('games')
      .where('inline_id', ctx.callbackQuery.inline_message_id)
      .first()
      .catch(debug)

    if (!game) {
      return ctx.answerCbQuery('Game was removed, sorry. Please try to start a new one, typing @chessy_bot to your message input.')
    }

    ctx.game.entry = game
    ctx.game.config = JSON.parse(game.config) || { rotation: 'dynamic' }

    const gameClient = chess.create({ PGN: true })
    const status = gameClient.getStatus()

    log(
      preLog('JOIN', `${game.id} ${makeUserLog(enemy)} ${makeUserLog(user)}`),
      ctx,
    )

    await ctx.editMessageCaption(
      `Black  (top): [${blacks.first_name}](tg://user?id=${blacks.id})
White  (bottom): [${whites.first_name}](tg://user?id=${whites.id})
White's turn | [Discussion](https://t.me/chessy_bot_chat)`,
      {
        ...board({
          board: status.board.squares,
          isWhite: true,
          actions: actions(),
        }),
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    ).catch(debug)

    return ctx.answerCbQuery('Now play!').catch(debug)
  },
]
