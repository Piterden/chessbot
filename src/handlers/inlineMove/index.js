const chess = require('chess')

const { debug } = require('@/helpers')
const { board } = require('@/keyboards')

const isWhiteTurn = (moves) => !(moves.length % 2)
const isWhiteUser = (game, ctx) => Number(game.whites_id) === ctx.from.id
const isBlackUser = (game, ctx) => Number(game.blacks_id) === ctx.from.id

const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `
${isCheck ? '|CHECK|' : ''}
${isCheckmate ? '|CHECKMATE|' : ''}
${isRepetition ? '|REPETITION|' : ''}`

const topMessage = (isWhiteTurn, player, enemy) => isWhiteTurn
  ? `White (top): ${player.first_name}
Black (bottom): ${enemy.first_name}
Black's turn`
  : `Black (top): ${player.first_name}
White (bottom): ${enemy.first_name}
White's turn`

const isReady = (game) => game && Boolean(game.whites_id && game.blacks_id)

module.exports = () => [
  /^([a-h])([1-8])$/,
  async (ctx) => {
    const gameEntry = await ctx.db('games')
      .where('inline_id', ctx.callbackQuery.inline_message_id)
      .first()

    if (!gameEntry) {
      return ctx.answerCbQuery('Game was removed, sorry. Please try to start a new one, typing @chessy_bot to your message input.')
    }

    if (!isReady(gameEntry)) {
      return ctx.answerCbQuery('Join the game to move pieces!')
    }

    if (![Number(gameEntry.whites_id), Number(gameEntry.blacks_id)]
      .includes(ctx.from.id)) {
      return ctx.answerCbQuery('This board is full, please start a new one.')
    }

    ctx.game.id = Number(gameEntry.id)

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
      pressed &&
      pressed.piece &&
      ((pressed.piece.side.name === 'white' && isWhiteTurn(gameMoves)) ||
      (pressed.piece.side.name === 'black' && !isWhiteTurn(gameMoves))) &&
      !(ctx.game.selected &&
        pressed.file === ctx.game.selected.file &&
        pressed.rank === ctx.game.selected.rank)
    ) {
      const allowedMoves = Object.keys(status.notatedMoves)
        .filter((key) => status.notatedMoves[key].src === pressed)
        .map((key) => ({ ...status.notatedMoves[key], key }))

      ctx.game.lastBoard = board(
        status.board.squares.map((square) => {
          const move = allowedMoves
            .find((({ file, rank }) => ({ dest }) => dest.file === file &&
              dest.rank === rank)(square))

          return move ? { ...square, destination: move } : square
        }),
        isWhiteTurn(gameMoves),
        [{
          text: 'Settings',
          callback_data: 'settings',
        }]
      )

      await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
        .catch(debug)

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
          game_id: ctx.game.id,
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

      ctx.game.lastBoard = board(
        status.board.squares,
        makeMove ? !isWhiteTurn(gameMoves) : isWhiteTurn(gameMoves),
        [{
          text: 'Settings',
          callback_data: 'settings',
        }]
      )

      await ctx.editMessageText(
        topMessage(
          makeMove ? isWhiteTurn(gameMoves) : !isWhiteTurn(gameMoves),
          makeMove ? ctx.from : enemy,
          makeMove ? enemy : ctx.from
        ) + statusMessage(status),
        ctx.game.lastBoard
      ).catch(debug)

      return ctx.answerCbQuery(`${makeMove.key}`)
    }
  },
]
