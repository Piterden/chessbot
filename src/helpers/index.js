const debug = require('./debug')
const emodji = require('./emodji')

const isWhiteTurn = (moves) => !(moves.length % 2)
const isWhiteUser = (game, ctx) => Number(game.whites_id) === ctx.from.id
const isBlackUser = (game, ctx) => Number(game.blacks_id) === ctx.from.id
const isReady = (game) => game && Boolean(game.whites_id && game.blacks_id)
const isPlayer = (game, ctx) => [Number(game.whites_id), Number(game.blacks_id)]
  .includes(ctx.from.id)

const mainMenu = [
  [{ text: 'My Games', callback_data: 'games' }],
  [{ text: 'High Scores', callback_data: 'scores' }],
  [{ text: 'Donate', callback_data: 'donate' }],
  [{ text: 'Support', callback_data: 'support' }],
  [{ text: 'Play with Friend', switch_inline_query: '' }],
]

const getGame = async (ctx) => {
  let game

  if (ctx.match && ctx.match[3]) {
    await ctx.db('games')
      .where('id', Number(ctx.match[3]))
      .update({ inline_id: ctx.callbackQuery.inline_message_id })

    game = await ctx.db('games')
      .where('id', Number(ctx.match[3]))
      .first()
  } else {
    game = ctx.game.entry || await ctx.db('games')
      .where('inline_id', ctx.callbackQuery.inline_message_id)
      .first()
  }

  if (!game) {
    return ctx.answerCbQuery('Game was removed, sorry. Please try to start a new one, typing @chessy_bot to your message input.')
  }

  if (!isReady(game)) {
    return ctx.answerCbQuery('Join the game to move pieces!')
  }

  if (!isPlayer(game, ctx)) {
    return ctx.answerCbQuery('This board is full, please start a new one.')
  }

  return game
}

const getGamePgn = (moves) => moves.reduce((acc, cur, idx) => idx % 2
  ? `${acc}${cur.entry} `
  : `${acc}${parseInt(idx / 2) + 1}. ${cur.entry} `, '')

module.exports = {
  debug,
  emodji,
  getGame,
  isReady,
  isPlayer,
  mainMenu,
  getGamePgn,
  isWhiteTurn,
  isWhiteUser,
  isBlackUser,
}
