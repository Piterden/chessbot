const chess = require('chess')

const { board } = require('@/keyboards')
const { debug, escapeUser, unescapeUser } = require('@/helpers')

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

const isReady = (game) => !!(game.whites_id && game.blacks_id)

module.exports = () => [
  /^([a-h])([1-8])$/,
  async (ctx) => {
    const gameEntry = await ctx.db('games')
      .where('id', ctx.game.id)
      .first()

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

    gameMoves.forEach(({ move }) => {
      try {
        gameClient.move(move)
      } catch (error) {
        debug(error)
      }
    })

    let moves = []
    let status = gameClient.getStatus()
    const square = status.board.squares
      .find(({ file, rank }) => file === ctx.match[1] && rank === Number(ctx.match[2]))

    if (!ctx.game.moves) {
      if (
        !square ||
        !square.piece ||
        (square.piece.side.name === 'black' && isWhiteTurn(gameMoves)) ||
        (square.piece.side.name === 'white' && !isWhiteTurn(gameMoves))
      ) {
        return ctx.answerCbQuery()
      }

      moves = Object.keys(status.notatedMoves)
        .filter((key) => status.notatedMoves[key].src === square)
        .map((key) => ({ ...status.notatedMoves[key], key }))

      await ctx.editMessageReplyMarkup(board(
        status.board.squares.map((sqr) => {
          const move = moves
            .find((({ file, rank }) => ({ dest }) => dest.file === file &&
              dest.rank === rank)(sqr))

          return move ? { ...sqr, destination: move } : sqr
        }),
        isWhiteTurn(gameMoves)
      ).reply_markup)
        .catch(debug)

      ctx.game.moves = moves
      ctx.game.selected = square
    } else {
      const moving = ctx.game.moves
        .find(({ dest: { file, rank } }) => file === square.file && rank === square.rank)

      if (moving && !gameMoves.find(({ move }) => move === moving.key)) {
        try {
          gameClient.move(moving.key)
        } catch (error) {
          debug(error)
        }

        status = gameClient.getStatus()

        await ctx.db('moves').insert({
          game_id: ctx.game.id,
          move: moving.key,
        })
          .catch(debug)
      }

      ctx.game.moves = null
      ctx.game.selected = null

      let enemy = await ctx.db('users')
        .where('id', isWhiteTurn(gameMoves)
          ? Number(gameEntry.whites_id)
          : Number(gameEntry.blacks_id))
        .first()
        .catch(debug)

      if (enemy) {
        enemy = unescapeUser(enemy)
      } else {
        // enemy = ctx.tg.getChatMember(
        //   ctx.callbackQuery.chat_instance,
        //   isWhiteTurn(gameMoves)
        //     ? Number(gameEntry.whites_id)
        //     : Number(gameEntry.blacks_id)
        // )
        // await ctx.db('users').insert(escapeUser(enemy)).catch(debug)
      }

      debug(enemy)

      await ctx.editMessageText(
        topMessage(
          gameMoves,
          ctx.update.callback_query.from,
          enemy
        ) + statusMessage(status),
        board(status.board.squares, !isWhiteTurn(gameMoves))
      )
        .catch(debug)
    }

    return ctx.answerCbQuery()
  },
]
