const chess = require('chess')

const { board } = require('@/keyboards')
const { debug, isWhiteTurn, topMessage, statusMessage } = require('@/helpers')

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

  function getFen (board) {
    const fen = []

    for (let idx = 0; idx < board.squares.length; idx += 1) {
      const square = board.squares[idx]

      if (square.file === 'a' && idx > 0) {
        fen.push('/')
      }

      if (square.piece) {
        fen.push(square.piece.side.name === 'white'
          ? (square.piece.notation || 'p').toUpperCase()
          : (square.piece.notation || 'p').toLowerCase())
      } else {
        if (isNaN(Number(fen[fen.length - 1]))) {
          fen.push(1)
        } else {
          if (square.file === 'a') {
            fen.push(1)
          } else {
            fen[fen.length - 1] += 1
          }
        }
      }
    }

    return fen.reverse().join('')
  }

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
      description: `Started ${game.created_at.getDate()}.${game.created_at.getMonth()}.${game.created_at.getFullYear()} | ${moves.length} turns`,
      thumb_url: `https://chessboardimage.com/${fen.replace(/\//g, '')}.png`,
      thumb_width: 418,
      thumb_height: 418,
      input_message_content: {
        parse_mode: 'Markdown',
        message_text: `Under construction!!!
${topMessage(!isWhiteTurn(moves), user, enemy)}
${statusMessage(status)}`,
      },
      ...board({
        board: status.board.squares,
        isWhite: isWhiteTurn(moves),
        callbackOverride: `rejoin::${game.id}`,
        actions: [{
          text: 'Join the game',
          callback_data: `rejoin::${game.id}`,
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

  if (!ctx.update.inline_query.offset) {
    results.push(
      {
        id: 1,
        type: 'sticker',
        sticker_file_id: 'CAADAgADNAADX5T2DgeepFdKYLnKAg',
        input_message_content: {
          parse_mode: 'Markdown',
          message_text: `Black (top): ?
  White (bottom): ${user.first_name}
  Waiting for a black side`,
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
    )
  } else {
    results = list
  }

  await ctx.answerInlineQuery(results, {
    is_personal: true,
    cache_time: 0,
    next_offset: !ctx.update.inline_query.offset
      ? 48
      : Number(ctx.update.inline_query.offset) + 50,
  })
}
