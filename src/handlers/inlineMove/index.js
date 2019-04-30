const chess = require('chess')

const { board } = require('@/keyboards')
const { debug } = require('@/helpers')

const isWhiteTurn = (moves) => !(moves.length % 2)
const isWhiteUser = (game, ctx) => Number(game.whites_id) === ctx.from.id
const isBlackUser = (game, ctx) => Number(game.blacks_id) === ctx.from.id

const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `
${isCheck ? '|CHECK|' : ''}
${isCheckmate ? '|CHECKMATE|' : ''}
${isRepetition ? '|REPETITION|' : ''}`

const topMessage = (moves, player, enemy) => isWhiteTurn(moves)
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
    const gameEntry = ctx.game.id
      ? await ctx.db('games').where('id', ctx.game.id).first()
      : await ctx.db('games').where('inline_id', ctx.callbackQuery.inline_message_id).first()

    debug(gameEntry)

    if (!isReady(gameEntry)) {
      return ctx.answerCbQuery('Join the game to move pieces!')
    }

    if (![Number(gameEntry.whites_id), Number(gameEntry.blacks_id)]
      .includes(ctx.from.id)) {
      return ctx.answerCbQuery('This board is full, please start a new one.')
    }

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
      !pressed ||
      !pressed.piece ||
      (pressed.piece.side.name === 'black' && isWhiteTurn(gameMoves)) ||
      (pressed.piece.side.name === 'white' && !isWhiteTurn(gameMoves))
    ) {
      return ctx.answerCbQuery()
    }

    if (!ctx.game.selected) {
      const allowedMoves = Object.keys(status.notatedMoves)
        .filter((key) => status.notatedMoves[key].src === pressed)
        .map((key) => ({ ...status.notatedMoves[key], key }))

      await ctx.editMessageReplyMarkup(board(
        status.board.squares.map((square) => {
          const move = allowedMoves
            .find((({ file, rank }) => ({ dest }) => dest.file === file &&
              dest.rank === rank)(square))

          return move ? { ...square, destination: move } : square
        }),
        isWhiteTurn(gameMoves)
      ).reply_markup)
        .catch(debug)

      ctx.game.allowedMoves = allowedMoves
      ctx.game.selected = pressed
    } else {
      const moving = ctx.game.allowedMoves
        .find(({ dest: { file, rank } }) => file === pressed.file && rank === pressed.rank)

      if (moving && !gameMoves.find(({ entry }) => entry === moving.key)) {
        try {
          gameClient.move(moving.key)
        } catch (error) {
          debug(error)
        }

        await ctx.db('moves').insert({
          game_id: ctx.game.id,
          entry: moving.key,
        })
          .catch(debug)
      }

      status = gameClient.getStatus()

      ctx.game.allowedMoves = null
      ctx.game.selected = null

      const enemy = await ctx.db('users')
        .where('id', ctx.from.id === Number(gameEntry.whites_id)
          ? Number(gameEntry.blacks_id)
          : Number(gameEntry.whites_id))
        .first()
        .catch(debug)

      await ctx.editMessageText(
        topMessage(gameMoves, ctx.from, enemy) + statusMessage(status),
        board(
          status.board.squares,
          !isWhiteTurn(gameMoves)
        )
      )
        .catch(debug)
    }

    return ctx.answerCbQuery()
  },
]
