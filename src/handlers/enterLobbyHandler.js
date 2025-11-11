import chess from 'chess'

import { debug, gameButton } from '../helpers.js'
import { getGamesWithMoves } from '../database.js'

export default () => [
  async (ctx) => {
    const games = await getGamesWithMoves(ctx.from.id)

    const inline_keyboard = [
      ...(await Promise.all(games.map(async (game) => [await gameButton(ctx, game)]))),
      [{ text: 'Create a new game', callback_data: 'new' }],
    ]

    ctx.session.listMessage = await ctx.reply(
      `Hi ${ctx.from.first_name || 'stranger'}, I'm the Chess bot.
${inline_keyboard.length > 1 ? '\nYour games:' : ''}`,
      { reply_markup: { inline_keyboard } },
    ).catch(debug)
  },
]
