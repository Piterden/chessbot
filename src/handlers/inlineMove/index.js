const chess = require('chess')

const {
  debug,
  getGame,
  topMessage,
  isWhiteTurn,
  isWhiteUser,
  isBlackUser,
  statusMessage,
} = require('@/helpers')
const { board, actions } = require('@/keyboards')

module.exports = () => [
  /^([a-h])([1-8])(?:::(\d+))?$/,
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
      .select()

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

          return move ? { ...square, destination: move } : square
        }),
        isWhite: ctx.game.config.rotation === 'dynamic'
          ? isWhiteTurn(gameMoves)
          : ctx.game.config.rotation === 'whites',
        actions: actions(),
      })

      if (!ctx.game.lastBoard) {
        ctx.game.lastBoard = lastBoard
        if (JSON.stringify(lastBoard.reply_markup) !== JSON.stringify(ctx.game.lastBoard.reply_markup)) {
          await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
            .catch(debug)
        }
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

    if (ctx.game.selected) {
      const makeMove = ctx.game.allowedMoves
        .find(({ dest: { file, rank } }) => file === pressed.file && rank === pressed.rank)

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

      await ctx.editMessageText(
        topMessage(
          makeMove ? isWhiteTurn(gameMoves) : !isWhiteTurn(gameMoves),
          makeMove ? ctx.from : enemy,
          makeMove ? enemy : ctx.from
        ) + statusMessage(status),
        {
          ...ctx.game.lastBoard,
          parse_mode: 'Markdown',
        }
      ).catch(debug)

      return ctx.answerCbQuery(`${makeMove ? makeMove.key : ''}`)
    }
  },
]
