import knex from 'knex'

import { debug } from './helpers.js'
import knexConfig from '../knexfile.js'

const db = knex(knexConfig)

export const addOrUpdateUser = async (user) => {
  const { id, first_name, last_name, language_code, username, is_bot, is_premium } = user
  await db('users')
    .insert({ id, first_name, last_name, language_code, username, is_bot, is_premium })
    .onConflict('id')
    .merge()
    .catch(debug)
}

export const getUser = async (id) => {
  const user = await db('users')
    .select('*')
    .where({ id })
    .first()
    .catch(debug)
  return user
}

export const addGame = async (props) => {
  const [game] = await db('games')
    .insert(props)
    .returning('id')
    .catch(debug)
  return game?.id
}

export const getGame = async (id) => {
  const game = await db('games')
    .select('*')
    .where({ id })
    .first()
    .catch(debug)
  return game
}

export const getGames = async (user_id) => {
  const games = await db('games')
    .select('*')
    .where((builder) => builder.whereNull('user_b').whereNot({ user_w: user_id }))
    .orWhere((builder) => builder.whereNull('user_w').whereNot({ user_b: user_id }))
    .orWhere((builder) => builder.whereNotNull('user_b').where({ user_w: user_id }))
    .orWhere((builder) => builder.whereNotNull('user_w').where({ user_b: user_id }))
    .orderBy('created_at', 'asc')
    .catch(debug)
  return games
}

export const updateGame = async (id, props = {}) => {
  const game = await db('games')
    .where({ id })
    .update(props)
    .catch(debug)
  return !!game
}

export const addMove = async (game_id, entry) => {
  const [move] = await db('moves')
    .insert({ game_id, entry })
    .returning('id')
    .catch(debug)
  return move?.id
}

export const getMoves = async (game_id) => {
  const moves = await db('moves')
    .select('entry')
    .where({ game_id })
    .orderBy('created_at', 'asc')
    .catch(debug)
  return moves
}

export const getGameWithMoves = async (game_id) => {
  const game = await getGame(game_id)
  return { ...game, moves: await getMoves(game.id) }
}

export const getGamesWithMoves = async (user_id) => {
  const games = await getGames(user_id)
  return Promise.all(games.map(async (game) =>
    ({ ...game, moves: await getMoves(game.id) })))
}
