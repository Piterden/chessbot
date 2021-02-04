const chess = require('chess')

const { board } = require('@/keyboards')
const { debug, isWhiteTurn, topMessage, statusMessage, getFen } = require('@/helpers')

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

  const games = await ctx.db('games')
    .where({ whites_id: ctx.from.id })
    .orWhere({ blacks_id: ctx.from.id })
    .orderBy('created_at', 'desc')
    .offset(Number(ctx.update.inline_query.offset))
    .limit(!ctx.update.inline_query.offset ? 48 : 50)
    .catch(debug)

  const list = await Promise.all(games.map(async (game, idx) => {
    const gameClient = chess.create({ PGN: true })
    let status

    const enemy = await ctx.db('users')
      .where('id', game.whites_id === ctx.from.id ? game.blacks_id : game.whites_id)
      .first()
      .catch(debug)

    const moves = await ctx.db('moves')
      .where('game_id', game.id)
      .orderBy('created_at', 'asc')
      .catch(debug)

    moves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    status = gameClient.getStatus()
    const fen = getFen(gameClient.game.board)

    return {
      id: !ctx.update.inline_query.offset
        ? idx + 3
        : idx + Number(ctx.update.inline_query.offset) + 2,
      type: 'article',
      title: `You vs ${enemy.first_name}`,
      description: `${moves.length} turns`, /// Started ${game.created_at.getDate()}.${game.created_at.getMonth()}.${game.created_at.getFullYear()} |
      thumb_url: `https://chessboardimage.com/${fen.replace(/\//g, '')}.png`,
      thumb_width: 418,
      thumb_height: 418,
      input_message_content: {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        message_text: `Waiting for confirmation by [${enemy.first_name}](tg://user?id=${enemy.id})!
${topMessage(!isWhiteTurn(moves), user, enemy)}
${statusMessage(status)} | [Discussion](https://t.me/chessy_bot_chat)`,
      },
      ...board({
        board: status.board.squares,
        isWhite: isWhiteTurn(moves),
        callbackOverride: `rejoin::${game.id}::${user.id}`,
        actions: [{
          text: 'Join the game',
          callback_data: `rejoin::${game.id}::${user.id}`,
        }, {
          text: 'New game',
          switch_inline_query_current_chat: '',
        }],
      }),
    }
  }))

  const gameClient = chess.create({ PGN: true })
  let status = gameClient.getStatus()
  let results = []
  console.log(ctx.update.inline_query.offset)
  if (!ctx.update.inline_query.offset) {
    results = [
      {
        id: 1,
        type: 'photo',
        photo_url: `${process.env.BOARD_VISUALIZER_URL}?fen=${getFen(gameClient.game.board)}&size=1024&coordinates=true&1`,
        thumb_url: `${process.env.BOARD_VISUALIZER_URL}?fen=${getFen(gameClient.game.board)}&size=240&coordinates=true&1`,
        caption: `Black (top): ?
White (bottom): ${user.first_name}
Waiting for a black side`,
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
      //       {
      //         id: 1,
      //         type: 'sticker',
      //         sticker_file_id: 'CAADAgADNAADX5T2DgeepFdKYLnKAg',
      //         input_message_content: {
      //           parse_mode: 'Markdown',
      //           message_text: `Black (top): ?
      // White (bottom): ${user.first_name}
      // Waiting for a black side`,
      //         },
      //         ...board({
      //           board: status.board.squares,
      //           isWhite: true,
      //           callbackOverride: `join::w::${user.id}`,
      //           actions: [{
      //             text: 'Join the game',
      //             callback_data: `join::w::${user.id}`,
      //           }, {
      //             text: 'New game',
      //             switch_inline_query_current_chat: '',
      //           }],
      //         }),
      //       },
      {
        id: 2,
        type: 'sticker',
        sticker_file_id: 'CAADAgADMwADX5T2DqhR9w5HSpCZAg',
        input_message_content: {
          parse_mode: 'Markdown',
          message_text: `White (top): ?
      Black (bottom): ${user.first_name}
      Waiting for a white side`,
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
      ...list,
    ]
  } else {
    results = list
  }
  console.log(results)
  await ctx.answerInlineQuery(results, {
    is_personal: true,
    cache_time: 0,
    // next_offset: !ctx.update.inline_query.offset
    //   ? 48
    //   : Number(ctx.update.inline_query.offset) + 50,
  }).catch(debug)
}
