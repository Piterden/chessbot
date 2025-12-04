import { inspect } from 'util'
import { getUser } from './database.js'

export const debug = (data) => console.log(inspect(data, {
  colors: true,
  showHidden: true,
  depth: 10,
}))

export const emodji = {
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

export const editUser = (method) => (user) => Object.keys(user).reduce((acc, key) => {
  acc[key] = typeof user[key] === 'string' ? method(user[key]) : user[key]
  return acc
}, {})
export const escapeUser = editUser(escape)
export const unescapeUser = editUser(unescape)

export const isWhiteTurn = (moves) => moves.length % 2 === 0
export const isBlackTurn = (moves) => moves.length % 2 === 1

export const isWhitePlayer = (ctx, game) => ctx.from.id === Number(game.user_w)
export const isBlackPlayer = (ctx, game) => ctx.from.id === Number(game.user_b)

export const whiteUserName = async (ctx, game) => {
  if (isWhitePlayer(ctx, game)) {
    return `${isWhiteTurn(game.moves) ? '!!! ' : ''}YOU`
  }
  if (game.user_w) {
    const user = await getUser(Number(game.user_w))
    return user ? unescape(user.first_name) : 'Waiting...'
  }
  return 'Waiting...'
}

export const blackUserName = async (ctx, game) => {
  if (ctx.from.id === Number(game.user_b)) {
    return `YOU${isBlackTurn(game.moves) ? ' !!!' : ''}`
  }
  if (game.user_b) {
    const user = await getUser(Number(game.user_b))
    return user ? unescape(user.first_name) : 'Waiting...'
  }
  return 'Waiting...'
}

export const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `
${isCheck ? '|CHECK|' : ''}
${isCheckmate ? '|CHECKMATE|' : ''}
${isRepetition ? '|REPETITION|' : ''}`

const getUserName = async (id) => {
  const user = await getUser(id)
  return user.first_name
}

export const topMessage = async (moves, game, isWhiteSide) => isWhiteSide
  ? `${isWhiteTurn(moves) ? '' : '*'} [BLACK] User ${await getUserName(game.user_b) || 'waiting...'}`
  : `${isBlackTurn(moves) ? '' : '*'} [WHITE] ${await getUserName(game.user_w) || 'waiting...'}`

export const bottomMessage = (moves, game, isWhiteSide) => isWhiteSide
  ? `${isWhiteTurn(moves) ? '*' : ''} [WHITE] YOU`
  : `${isBlackTurn(moves) ? '*' : ''} [BLACK] YOU`

export const isReady = ({ board_w, board_b, actions_w, actions_b, user_w, user_b }) =>
  !!(board_w && board_b && actions_w && actions_b && user_w && user_b)

export const gameButton = async (ctx, game) => ({
  text: `${await whiteUserName(ctx, game)} / ${await blackUserName(ctx, game)} | ${game.moves.length} moves`,
  callback_data: `join/${game.id}`,
})

export const deepDiff = (first, second) => {
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
