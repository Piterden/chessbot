const chess = require('chess')

const { board, actions } = require('@/keyboards')
const { debug, getGame, isWhiteTurn, topMessage, statusMessage } = require('@/helpers')

const { BOARD_IMAGE_BASE_URL } = process.env

module.exports = () => [
  /^rejoin::(\d+)::(\d+)/,
  async (ctx) => {
    if (ctx.game.busy) {
      return ctx.answerCbQuery()
    }
    ctx.game.busy = true
    let [, gameId, enemyId] = ctx.match

    gameId = Number(gameId)
    enemyId = Number(enemyId)

    if (ctx.from.id === enemyId) {
      ctx.game.busy = false
      return ctx.answerCbQuery('You can\'t rejoin yourself!')
    }

    const game = await getGame(ctx, gameId).catch(debug)

    if (!game) {
      ctx.game.busy = false
      return ctx.answerCbQuery('Game was removed, sorry. Please try to start a new one, typing @chessy_bot to your message input.')
    }

    if (![Number(game.whites_id), Number(game.blacks_id)]
      .includes(Number(ctx.from.id))) {
      ctx.game.busy = false
      return ctx.answerCbQuery('Sorry, you can\'t join this game!')
    }

    await ctx.db('games')
      .update({
        inline_id: ctx.callbackQuery.inline_message_id,
        updated_at: new Date(),
      })
      .where({ id: gameId })
      .catch(debug)

    ctx.game.entry = game
    ctx.game.config = JSON.parse(game.config) || { rotation: 'dynamic' }
    ctx.game.inlineId = ctx.callbackQuery.inline_message_id

    const moves = await ctx.db('moves')
      .where('game_id', gameId)
      .orderBy('created_at', 'asc')
      .catch(debug)

    const gameClient = chess.create({ PGN: true })

    moves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    const status = gameClient.getStatus()

    const whites = await ctx.db('users')
      .where('id', game.whites_id)
      .first()
      .catch(debug)

    const blacks = await ctx.db('users')
      .where('id', game.blacks_id)
      .first()
      .catch(debug)

    ctx.game.busy = false

    await ctx.editMessageMedia(
      {
        type: 'photo',
        media: `${BOARD_IMAGE_BASE_URL}${gameClient.getFen().replace(/\//g, '%2F')}.jpeg?rotate=${Number(!isWhiteTurn(moves))}`,
        caption: topMessage(!isWhiteTurn(moves), whites, blacks) + statusMessage(status),
      },
      {
        ...board({
          board: status.board.squares,
          isWhite: isWhiteTurn(moves),
          actions: actions(),
        }),
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    ).catch(debug)

    return ctx.answerCbQuery('Now play!')
  },
]
