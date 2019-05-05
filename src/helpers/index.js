const debug = require('./debug')
const emodji = require('./emodji')

module.exports = {
  debug,
  emodji,
  isWhiteTurn: (moves) => !(moves.length % 2),
  isWhiteUser: (game, ctx) => Number(game.whites_id) === ctx.from.id,
  isBlackUser: (game, ctx) => Number(game.blacks_id) === ctx.from.id,
  isReady: (game) => game && Boolean(game.whites_id && game.blacks_id),
  isPlayer: (game, ctx) => [Number(game.whites_id), Number(game.blacks_id)]
    .includes(ctx.from.id),

  async getGame (ctx) {
    let gameEntry = ctx.game.entry

    if (!gameEntry) {
      gameEntry = await ctx.db('games')
        .where('inline_id', ctx.callbackQuery.inline_message_id)
        .first()
    }

    if (!gameEntry) {
      return ctx.answerCbQuery('Game was removed, sorry. Please try to start a new one, typing @chessy_bot to your message input.')
    }

    if (!this.isReady(gameEntry)) {
      return ctx.answerCbQuery('Join the game to move pieces!')
    }

    if (!this.isPlayer(gameEntry, ctx)) {
      return ctx.answerCbQuery('This board is full, please start a new one.')
    }

    return gameEntry
  },
}
