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
}
