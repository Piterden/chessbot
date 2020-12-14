const chess = require('chess')

const { board } = require('@/keyboards')
const { debug, isWhiteTurn } = require('@/helpers')

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

  // const match = ctx.inlineQuery.query.match(/^\s*(\d+)::(\d+)\s*$/)

  // if (match) {
  //   const games = await ctx.db('games')
  //     .where({
  //       whites_id: match[1],
  //       blacks_id: match[2],
  //     })
  //     .orWhere({
  //       whites_id: match[2],
  //       blacks_id: match[1],
  //     })
  //     .catch(debug)

  //   if (games && games.length > 0) {
  //     const enemyId = Number(match[1]) === ctx.from.id
  //       ? Number(match[2])
  //       : Number(match[1])

  //     const list = await Promise.all(games.slice(0, 50).map(async (game, idx) => {
  //       const enemy = await ctx.db('users')
  //         .where('id', enemyId)
  //         .first()
  //         .catch(debug)

  //       const moves = await ctx.db('moves')
  //         .where('game_id', game.id)
  //         .orderBy('created_at', 'asc')
  //         .select()
  //         .catch(debug)

  //       moves.forEach(({ entry }) => {
  //         try {
  //           gameClient.move(entry)
  //         } catch (error) {
  //           debug(error)
  //         }
  //       })

  //       status = gameClient.getStatus()

  //       return {
  //         id: idx + 1,
  //         type: 'article',
  //         title: `Game #${game.id}`,
  //         description: `Moves: ${moves.length}.
  // ${isWhiteTurn(moves) ? 'Whites' : 'Blacks'} turn.`,
  //         input_message_content: {
  //           message_text: `Black (top): ${enemy.first_name}
  // White (bottom): ${user.first_name}`,
  //         },
  //         ...board(
  //           status.board.squares,
  //           isWhiteTurn(moves),
  //           [{
  //             text: 'Settings',
  //             callback_data: 'settings',
  //           }],
  //           `::${game.id}`
  //         ),
  //       }
  //     }))

  //     await ctx.answerInlineQuery(list, {
  //       is_personal: true,
  //       cache_time: 0,
  //     })
  //   }
  // }

  const games = await ctx.db('games')
    .where({ whites_id: ctx.from.id })
    .orWhere({ blacks_id: ctx.from.id })
    .orderBy('created_at', 'desc')
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

  const list = await Promise.all(games.slice(0, 48).map(async (game, idx) => {
    const gameClient = chess.create({ PGN: true })
    // let status

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

    // status = gameClient.getStatus()
    const fen = getFen(gameClient.game.board)
    console.log(fen)

    return {
      id: idx + 3,
      type: 'article',
      title: `You vs ${enemy.first_name}`,
      description: `Started ${game.created_at.getDate()}.${game.created_at.getMonth()}.${game.created_at.getFullYear()} | Moves ${moves.length}
${isWhiteTurn(moves) ? 'Whites' : 'Blacks'} turn.`,
      thumb_url: `https://chessboardimage.com/${fen.replace(/\//g, '')}.png`,
      thumb_width: 418,
      thumb_height: 418,
      input_message_content: {
        message_text: `Under construction!!!
Black (top): ${enemy.first_name}
White (bottom): ${user.first_name}`,
      },
      // ...board({
      //   board: status.board.squares,
      //   isWhite: isWhiteTurn(moves),
      //   callbackOverride: `join::w::${user.id}`,
      //   actions: [{
      //     text: 'Join the game',
      //     callback_data: `join::w::${user.id}`,
      //   }, {
      //     text: 'New game',
      //     switch_inline_query_current_chat: '',
      //   }],
      // }),
    }
  }))

  const gameClient = chess.create({ PGN: true })
  let status = gameClient.getStatus()

  await ctx.answerInlineQuery([
    {
      id: 1,
      type: 'sticker',
      sticker_file_id: 'CAADAgADNAADX5T2DgeepFdKYLnKAg',
      // title: 'Start a new game as white',
      input_message_content: {
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
      // title: 'Start a new game as black',
      input_message_content: {
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
  ], {
    is_personal: true,
    cache_time: 0,
  })
}
