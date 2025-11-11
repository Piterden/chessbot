import { inspect } from 'util'
import { getUser } from './database.js'

const debug = (data) => console.log(inspect(data, {
  colors: true,
  showHidden: true,
  depth: 10,
}))

const emodji = {
  white: {
    rook: '♜',
    knight: '♞',
    bishop: '♟',
    queen: '♛',
    king: '♚',
    pawn: '♝',
  },
  black: {
    rook: '♖',
    knight: '♘',
    bishop: '♙',
    queen: '♕',
    king: '♔',
    pawn: '♗',
  },
}

const editUser = (method) => (user) => Object.keys(user).reduce((acc, key) => {
  acc[key] = typeof user[key] === 'string' ? method(user[key]) : user[key]
  return acc
}, {})
const escapeUser = editUser(escape)
const unescapeUser = editUser(unescape)

const isWhiteTurn = (moves) => moves.length % 2 === 0
const isBlackTurn = (moves) => moves.length % 2 === 1

const isWhitePlayer = (ctx, game) => ctx.from.id === Number(game.user_w)
const isBlackPlayer = (ctx, game) => ctx.from.id === Number(game.user_b)

const whiteUserName = async (ctx, game) => {
  if (isWhitePlayer(ctx, game)) {
    return `${isWhiteTurn(game.moves) ? '!!! ' : ''}YOU`
  }
  if (game.user_w) {
    const user = await getUser(Number(game.user_w))
    return user ? unescape(user.first_name) : 'No player'
  }
  return 'No player'
}

const blackUserName = async (ctx, game) => {
  if (ctx.from.id === Number(game.user_b)) {
    return `YOU${isBlackTurn(game.moves) ? ' !!!' : ''}`
  }
  if (game.user_b) {
    const user = await getUser(Number(game.user_b))
    return user ? unescape(user.first_name) : 'Waiting...'
  }
  return 'Waiting...'
}

const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `
${isCheck ? '|CHECK|' : ''}
${isCheckmate ? '|CHECKMATE|' : ''}
${isRepetition ? '|REPETITION|' : ''}`

const topMessage = (moves, game, isWhiteSide) => isWhiteSide
  ? `${isWhiteTurn(moves) ? '*' : ''} [BLACK] User ${game.user_b || 'waiting...'}`
  : `${isBlackTurn(moves) ? '*' : ''} [WHITE] ${game.user_w}`

const bottomMessage = (moves, game, isWhiteSide) => isWhiteSide
  ? `${isBlackTurn(moves) ? '*' : ''} [WHITE] YOU`
  : `${isWhiteTurn(moves) ? '*' : ''} [BLACK] YOU`

const isReady = ({ board_w, board_b, actions_w, actions_b, user_w, user_b }) =>
  !!(board_w && board_b && actions_w && actions_b && user_w && user_b)

const gameButton = async (ctx, game) => ({
  text: `${await whiteUserName(ctx, game)} / ${await blackUserName(ctx, game)} | ${game.moves.length} moves`,
  callback_data: `join/${game.id}`,
})

const deepDiff = (first, second) => {
  if (first === second) return true
  if (first === null || second === null) return false
  if (typeof first !== 'object' || typeof second !== 'object') return false

  let first_keys = Object.getOwnPropertyNames(first)
  let second_keys = Object.getOwnPropertyNames(second)

  if (first_keys.length !== second_keys.length) return false
  for(let key of first_keys) {
    if(!Object.hasOwn(second, key)) return false
    if (deepDiff(first[key], second[key]) === false) return false
  }
  return true
}

export {
  debug,
  emodji,
  isReady,
  deepDiff,
  escapeUser,
  gameButton,
  topMessage,
  isBlackTurn,
  isWhiteTurn,
  unescapeUser,
  isWhitePlayer,
  isBlackPlayer,
  bottomMessage,
  statusMessage,
  blackUserName,
  whiteUserName,
}
