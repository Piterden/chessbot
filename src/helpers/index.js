const { inspect } = require('util')

const emodji = {
  white: {
    rook: '♜',
    knight: '♞',
    bishop: '♝',
    queen: '♛',
    king: '♚',
    pawn: '♟',
  },
  black: {
    rook: '♖',
    knight: '♘',
    bishop: '♗',
    queen: '♕',
    king: '♔',
    pawn: '♙',
  },
}

const letters = {
  white: {
    rook: 'WR',
    knight: 'WN',
    bishop: 'WB',
    queen: 'WQ',
    king: 'WK',
    pawn: 'wp',
  },
  black: {
    rook: 'BR',
    knight: 'BN',
    bishop: 'BB',
    queen: 'BQ',
    king: 'BK',
    pawn: 'bp',
  },
}

/**
 * Sleep pause.
 *
 * @param {Number} time The time in milliseconds.
 * @return {Promise<void>}
 */
const sleep = (time) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

const debug = (data) => console.log(inspect(data, {
  colors: true,
  showHidden: true,
  depth: 10,
}))

const isWhiteTurn = (moves) => !(moves.length % 2)
const isBlackTurn = (moves) => moves.length % 2
const isReady = (game) => game && Boolean(game.whites_id && game.blacks_id)
const isPlayer = (game, ctx) => [Number(game.whites_id), Number(game.blacks_id)]
  .includes(ctx.from.id)

const isWhiteUser = (game, ctx) => {
  if (!game) {
    ctx.answerCbQuery('Sorry, game not found.')
    return false
  }
  return Number(game.whites_id) === ctx.from.id
}

const isBlackUser = (game, ctx) => {
  if (!game) {
    ctx.answerCbQuery('Sorry, game not found.')
    return false
  }
  return Number(game.blacks_id) === ctx.from.id
}

const mainMenu = [
  [{ text: 'My Games', callback_data: 'games' }],
  [{ text: 'High Scores', callback_data: 'scores' }],
  [{ text: 'Donate', callback_data: 'donate' }],
  [{ text: 'Support', callback_data: 'support' }],
  [{ text: 'Play with Friend', switch_inline_query: '' }],
]

const getGame = async (ctx) => {
  if (ctx.match && ctx.match[3]) {
    await ctx.db('games')
      .where('id', Number(ctx.match[3]))
      .update({ inline_id: ctx.callbackQuery.inline_message_id })

    const game = await ctx.db('games')
      .where('id', Number(ctx.match[3]))
      .first()

    return game
  }

  const game = ctx.game.entry || await ctx.db('games')
    .where('inline_id', ctx.callbackQuery.inline_message_id)
    .first()

  return game
}

const validateGame = (game, ctx) => {
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

const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `${isCheck ? '|CHECK|' : ''}${isCheckmate ? '|CHECKMATE|' : ''}${isRepetition ? '|REPETITION|' : ''}`

const topMessage = (whiteTurn, player, enemy) => whiteTurn
  ? `White (top): [${player.first_name}](tg://user?id=${player.id})
Black (bottom): [${enemy.first_name}](tg://user?id=${enemy.id})
Black's turn`
  : `Black (top): [${player.first_name}](tg://user?id=${player.id})
White (bottom): [${enemy.first_name}](tg://user?id=${enemy.id})
White's turn`

module.exports = {
  debug,
  sleep,
  emodji,
  getGame,
  isReady,
  letters,
  isPlayer,
  mainMenu,
  getGamePgn,
  topMessage,
  isBlackTurn,
  isWhiteTurn,
  isBlackUser,
  isWhiteUser,
  validateGame,
  statusMessage,
}
