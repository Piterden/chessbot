const chess = require('chess')

const {
  log,
  debug,
  getFen,
  preLog,
  getGame,
  topMessage,
  isWhiteTurn,
  isWhiteUser,
  isBlackUser,
  makeUserLog,
  statusMessage,
} = require('@/helpers')
const { board, actions, promotion } = require('@/keyboards')

module.exports = () => [
  /^([a-h])([1-8])([QRNB])?$/,
  async (ctx) => {
    const gameEntry = await getGame(ctx)

    if (typeof gameEntry === 'boolean') {
      return gameEntry
    }

    if (!isBlackUser(gameEntry, ctx) && !isWhiteUser(gameEntry, ctx)) {
      return ctx.answerCbQuery('Sorry, this game is busy. Try to make a new one.')
    }

    ctx.game.entry = gameEntry
    ctx.game.config = JSON.parse(gameEntry.config) || { rotation: 'dynamic' }

    const gameMoves = await ctx.db('moves')
      .where('game_id', gameEntry.id)
      .orderBy('created_at', 'asc')
      .catch(debug)

    if ((isWhiteTurn(gameMoves) && isBlackUser(gameEntry, ctx)) ||
      (!isWhiteTurn(gameMoves) && isWhiteUser(gameEntry, ctx))) {
      return ctx.answerCbQuery('Wait, please. Now is not your turn.')
    }

    const gameClient = chess.create({ PGN: true })

    gameMoves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    let status = gameClient.getStatus()
    const pressed = status.board.squares
      .find(({ file, rank }) => file === ctx.match[1] && rank === Number(ctx.match[2]))

    /**
     * Selection of a piece
     */
    if (
      pressed && pressed.piece &&
      ((pressed.piece.side.name === 'white' && isWhiteTurn(gameMoves)) ||
      (pressed.piece.side.name === 'black' && !isWhiteTurn(gameMoves))) &&
      !(ctx.game.selected &&
        pressed.file === ctx.game.selected.file &&
        pressed.rank === ctx.game.selected.rank)
    ) {
      const allowedMoves = Object.keys(status.notatedMoves)
        .filter((key) => status.notatedMoves[key].src === pressed)
        .map((key) => ({ ...status.notatedMoves[key], key }))

      const lastBoard = board({
        board: status.board.squares.map((square) => {
          const move = allowedMoves
            .find((({ file, rank }) => ({ dest }) => dest.file === file &&
              dest.rank === rank)(square))

          return move ? { ...square, move } : square
        }),
        isWhite: ctx.game.config.rotation === 'dynamic'
          ? isWhiteTurn(gameMoves)
          : ctx.game.config.rotation === 'whites',
        actions: actions(),
      })

      if (!ctx.game.lastBoard) {
        ctx.game.lastBoard = lastBoard
        await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
          .catch(debug)
      }

      ctx.game.allowedMoves = allowedMoves
      ctx.game.selected = pressed

      return ctx.answerCbQuery(`${pressed.piece.type} ${pressed.file}${pressed.rank}`)
    }

    if (
      !ctx.game.selected &&
      (!pressed ||
      !pressed.piece ||
      (pressed.piece.side.name === 'black' && isWhiteTurn(gameMoves)) ||
      (pressed.piece.side.name === 'white' && !isWhiteTurn(gameMoves)))
    ) {
      return ctx.answerCbQuery()
    }

    /**
     * Selection of a destination to move
     */
    if (ctx.game.selected) {
      if (
        ctx.game.selected.piece.type === 'pawn' &&
        (
          (isWhiteTurn(gameMoves) && ctx.game.selected.rank === 7) ||
          (!isWhiteTurn(gameMoves) && ctx.game.selected.rank === 2)
        ) &&
        (
          (isWhiteTurn(gameMoves) && pressed.rank === 8) ||
          (!isWhiteTurn(gameMoves) && pressed.rank === 1)
        ) &&
        !ctx.game.promotion
      ) {
        ctx.game.promotion = pressed

        const makeMoves = ctx.game.allowedMoves.filter(
          ({ dest: { file, rank } }) => file === pressed.file && rank === pressed.rank,
        )
        const keyboardRow = promotion({ makeMoves, pressed })
        const board = ctx.game.lastBoard.reply_markup

        board.inline_keyboard.unshift(keyboardRow)

        await ctx.editMessageReplyMarkup(board)
          .catch(debug)

        return ctx.answerCbQuery()
      }

      let makeMove

      if (ctx.game.promotion) {
        makeMove = ctx.game.allowedMoves.find(({ key, dest: { file, rank } }) => (
          file === pressed.file && rank === pressed.rank && key.endsWith(ctx.match[3])
        ))
        ctx.game.promotion = null
      } else {
        makeMove = ctx.game.allowedMoves.find(
          ({ dest: { file, rank } }) => file === pressed.file && rank === pressed.rank,
        )
      }

      if (makeMove) {
        try {
          gameClient.move(makeMove.key)
        } catch (error) {
          debug(error)
        }

        await ctx.db('moves').insert({
          game_id: ctx.game.entry.id,
          entry: makeMove.key,
        }).catch(debug)

        log(
          preLog('MOVE', `${gameEntry.id} ${makeMove.key} ${gameMoves.length + 1} ${makeUserLog(ctx.from)}`),
          ctx,
        )
      }

      status = gameClient.getStatus()

      ctx.game.allowedMoves = null
      ctx.game.selected = null

      const enemy = await ctx.db('users')
        .where('id', isWhiteUser(gameEntry, ctx)
          ? Number(gameEntry.blacks_id)
          : Number(gameEntry.whites_id))
        .first()
        .catch(debug)

      ctx.game.lastBoard = board({
        board: status.board.squares,
        isWhite: ctx.game.config.rotation === 'dynamic'
          ? (makeMove ? !isWhiteTurn(gameMoves) : isWhiteTurn(gameMoves))
          : ctx.game.config.rotation === 'whites',
        actions: actions(),
      })

      await ctx.editMessageMedia(
        {
          type: 'photo',
          media: `${process.env.BOARD_VISUALIZER_URL}?fen=${getFen(gameClient.game.board)}&size=1024&coordinates=true&1`,
          caption:
            topMessage(
              makeMove ? isWhiteTurn(gameMoves) : !isWhiteTurn(gameMoves),
              makeMove ? ctx.from : enemy,
              makeMove ? enemy : ctx.from,
            ) + statusMessage(status),
        },
        {
          ...ctx.game.lastBoard,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        },
      ).catch(debug)

      return ctx.answerCbQuery(`${makeMove ? makeMove.key : ''}`)
    }
  },
]
