const chess = require('chess')

const { board, actions } = require('@/keyboards')
const { debug, preLog, log, makeUserLog, getFen } = require('@/helpers')

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

    await ctx.db('games').insert({
      whites_id: iAmWhite ? ctx.from.id : enemy.id,
      blacks_id: iAmWhite ? enemy.id : ctx.from.id,
      inline_id: ctx.callbackQuery.inline_message_id,
      config: JSON.stringify({ rotation: 'dynamic' }),
    }).catch(debug)

    const game = await ctx.db('games')
      .where('inline_id', ctx.callbackQuery.inline_message_id)
      .first()
      .catch(debug)

    if (!game) {
      return ctx.answerCbQuery('Game was removed, sorry. Please try to start a new one, typing @chessy_bot to your message input.')
    }

    ctx.game.entry = game
    ctx.game.config = JSON.parse(game.config) || { rotation: 'dynamic' }
    ctx.game.inlineId = ctx.callbackQuery.inline_message_id

    const gameClient = chess.create({ PGN: true })
    const status = gameClient.getStatus()

    ctx.game.lastBoard = board({
      board: status.board.squares,
      isWhite: ctx.game.config.rotation === 'dynamic' ||
        ctx.game.config.rotation === 'whites',
      actions: actions(`last::${ctx.game.entry.id}`),
    })

    log(
      preLog('JOIN', `${game.id} ${makeUserLog(enemy)} ${makeUserLog(user)}`),
      ctx
    )

    await ctx.editMessageCaption(
      iAmWhite
        ? `Black  (top): [${enemy.first_name}](tg://user?id=${enemy.id})
White  (bottom): [${user.first_name}](tg://user?id=${user.id})
White's turn | [Discussion](https://t.me/chessy_bot_chat)`
        : `Black  (top): [${user.first_name}](tg://user?id=${user.id})
White  (bottom): [${enemy.first_name}](tg://user?id=${enemy.id})
White's turn | [Discussion](https://t.me/chessy_bot_chat)`,
      {
        ...ctx.game.lastBoard,
        parse_mode: 'Markdown',
      }
    ).catch(debug)

    ctx.game.joined = true

    return ctx.answerCbQuery('Now play!').catch(debug)
  },
]
