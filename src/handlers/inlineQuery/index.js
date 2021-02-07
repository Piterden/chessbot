const chess = require('chess')

const { debug } = require('@/helpers')
const { board } = require('@/keyboards')

module.exports = () => async (ctx) => {
  const gameClient = chess.create({ PGN: true })
  let status = gameClient.getStatus()

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

  //   const match = ctx.inlineQuery.query.match(/^\s*(\d+)::(\d+)\s*$/)

  //   if (match) {
  //     const games = await ctx.db('games')
  //       .where({
  //         whites_id: match[1],
  //         blacks_id: match[2],
  //       })
  //       .orWhere({
  //         whites_id: match[2],
  //         blacks_id: match[1],
  //       })
  //       .catch(debug)

  //     if (games && games.length > 0) {
  //       const enemyId = Number(match[1]) === ctx.from.id
  //         ? Number(match[2])
  //         : Number(match[1])

  //       const list = await Promise.all(games.slice(0, 50).map(async (game, idx) => {
  //         const enemy = await ctx.db('users')
  //           .where('id', enemyId)
  //           .first()
  //           .catch(debug)

  //         const moves = await ctx.db('moves')
  //           .where('game_id', game.id)
  //           .orderBy('created_at', 'asc')
  //           .select()
  //           .catch(debug)

  //         moves.forEach(({ entry }) => {
  //           try {
  //             gameClient.move(entry)
  //           } catch (error) {
  //             debug(error)
  //           }
  //         })

  //         status = gameClient.getStatus()

  //         return {
  //           id: idx + 1,
  //           type: 'article',
  //           title: `Game #${game.id}`,
  //           description: `Moves: ${moves.length}.
  // ${isWhiteTurn(moves) ? 'Whites' : 'Blacks'} turn.`,
  //           input_message_content: {
  //             parse_mode: 'Markdown',
  //             disable_web_page_preview: true,
  //             message_text: `Black (top): ${enemy.first_name}
  // White (bottom): ${user.first_name}`,
  //           },
  //           ...board(
  //             status.board.squares,
  //             isWhiteTurn(moves),
  //             [{
  //               text: 'Settings',
  //               callback_data: 'settings',
  //             }],
  //             `::${game.id}`
  //           ),
  //         }
  //       }))

  //       await ctx.answerInlineQuery(list, {
  //         is_personal: true,
  //         cache_time: 0,
  //       })
  //     }
  //   }

  await ctx.answerInlineQuery([
    {
      id: 1,
      type: 'sticker',
      sticker_file_id: 'CAADAgADNAADX5T2DgeepFdKYLnKAg',
      input_message_content: {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        message_text: `Black (top): ?
White (bottom): ${user.first_name}
Waiting for a black side | [Discussion](https://t.me/chessy_bot_chat)`,
      },
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
      type: 'sticker',
      sticker_file_id: 'CAADAgADMwADX5T2DqhR9w5HSpCZAg',
      input_message_content: {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        message_text: `White (top): ?
Black (bottom): ${user.first_name}
Waiting for a white side | [Discussion](https://t.me/chessy_bot_chat)`,
      },
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
  ], {
    is_personal: true,
    cache_time: 0,
  }).catch(debug)
}
