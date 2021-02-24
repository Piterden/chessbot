const chess = require('chess')

const {
  log,
  debug,
  sleep,
  preLog,
  getGame,
  topMessage,
  isBlackTurn,
  isWhiteTurn,
  isWhiteUser,
  isBlackUser,
  makeUserLog,
  statusMessage,
} = require('@/helpers')
const { board, actions } = require('@/keyboards')

const { BOARD_IMAGE_BASE_URL } = process.env

module.exports = () => [
  /^last$/,
  async (ctx) => {
    if (ctx.game.busy) {
      return ctx.answerCbQuery()
    }
    ctx.game.busy = true

    const game = await getGame(ctx).catch(debug)

    if (typeof game === 'boolean') {
      return game
    }

    const moves = await ctx.db('moves')
      .where('game_id', game.id)
      .orderBy('created_at', 'asc')
      .select()
      .catch(debug)

    if (!((isWhiteUser(game, ctx) && isWhiteTurn(moves)) ||
      (isBlackUser(game, ctx) && isBlackTurn(moves)))) {
      ctx.game.busy = false
      return ctx.answerCbQuery('Don\'t touch')
    }

    const enemy = await ctx.db('users')
      .where('id', isWhiteUser(game, ctx)
        ? Number(game.blacks_id)
        : Number(game.whites_id))
      .first()
      .catch(debug)

    log(
      preLog('LAST', `${game.id} ${moves.length} ${makeUserLog(ctx.from)}`),
      ctx,
    )

    const gameClient = chess.create({ PGN: true })
    const lastMove = moves.pop()

    moves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    const prevStatus = gameClient.getStatus()
    const prevBoard = board({
      board: prevStatus.board.squares,
      isWhite: !isWhiteTurn(moves),
      actions: actions(),
    })
    const prevFen = gameClient.getFen()

    try {
      gameClient.move(lastMove.entry)
    } catch (error) {
      debug(error)
    }

    const currentStatus = gameClient.getStatus()
    const currentBoard = board({
      board: currentStatus.board.squares,
      isWhite: !isWhiteTurn(moves),
      actions: actions(),
    })
    const currentFen = gameClient.getFen()

    await ctx.editMessageMedia(
      {
        type: 'photo',
        media: `${BOARD_IMAGE_BASE_URL}${prevFen.replace(/\//g, '%2F')}.jpeg?rotate=${!isWhiteTurn(moves) ? 0 : 1}`,
        caption: topMessage(isWhiteTurn(moves), enemy, ctx.from) + statusMessage(currentStatus),
      },
      {
        ...prevBoard,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    ).catch(debug)

    await sleep(600)

    await ctx.editMessageMedia(
      {
        type: 'photo',
        media: `${BOARD_IMAGE_BASE_URL}${currentFen.replace(/\//g, '%2F')}.jpeg?rotate=${!isWhiteTurn(moves) ? 0 : 1}`,
        caption: topMessage(isWhiteTurn(moves), enemy, ctx.from) + statusMessage(currentStatus),
      },
      {
        ...currentBoard,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    ).catch(debug)

    ctx.game.busy = false
    return ctx.answerCbQuery()
  },
]
