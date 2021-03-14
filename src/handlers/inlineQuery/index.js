const chess = require('chess')

const { board } = require('@/keyboards')
const { debug, makeBoardImageUrl } = require('@/helpers')

module.exports = () => async (ctx) => {
  let user = await ctx.db('users')
    .where('id', Number(ctx.from.id))
    .first()

  if (user) {
    if (JSON.stringify(user) !== JSON.stringify(ctx.from)) {
      await ctx.db('users')
        .where('id', Number(user.id))
        .update(ctx.from)
        .catch(debug)
    }
  } else {
    await ctx.db('users').insert(ctx.from).catch(debug)
    user = await ctx.db('users').where('id', ctx.from.id).first().catch(debug)
  }

  const gameClient = chess.create({ PGN: true })
  const status = gameClient.getStatus()
  const fen = gameClient.getFen()
  await ctx.answerInlineQuery([
    {
      id: 1,
      type: 'photo',
      photo_url: makeBoardImageUrl(fen),
      thumb_url: makeBoardImageUrl(fen),
      title: 'Play as white',
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      caption: `Black (top): ?
White (bottom): ${user.first_name.replace(/_/g, '\\_')}
Waiting for a black side | [Discussion](https://t.me/chessy_bot_chat)`,
      ...board({
        board: status.board.squares,
        isWhite: true,
        callbackOverride: `join::w::${user.id}`,
        actions: [{
          text: 'Join the game',
          callback_data: `join::w::${user.id}`,
        }, {
          text: 'New game',
          switch_inline_query_current_chat: '',
        }],
      }),
    },
    {
      id: 2,
      type: 'photo',
      photo_url: makeBoardImageUrl(fen, { rotate: 1 }),
      thumb_url: makeBoardImageUrl(fen, { rotate: 1 }),
      title: 'Play as black',
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      caption: `White (top): ?
Black (bottom): ${user.first_name.replace(/_/g, '\\_')}
Waiting for a white side | [Discussion](https://t.me/chessy_bot_chat)`,
      ...board({
        board: status.board.squares,
        isWhite: false,
        callbackOverride: `join::b::${user.id}`,
        actions: [{
          text: 'Join the game',
          callback_data: `join::b::${user.id}`,
        }, {
          text: 'New game',
          switch_inline_query_current_chat: '',
        }],
      }),
    },
    // ...list,
  ], {
    is_personal: true,
    cache_time: 0,
  }).catch(debug)
}
