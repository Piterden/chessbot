import { debug, gameButton } from '../helpers.js'
import { getGamesWithMoves } from '../database.js'

export default () => [
  async (ctx) => {
    const games = await getGamesWithMoves(ctx.from.id)

    const inline_keyboard = [
      ...(await Promise.all(games.map(async (game) => [await gameButton(ctx, game)]))),
      [{ text: 'New game with white', callback_data: 'neww' }],
      [{ text: 'New game with black', callback_data: 'newb' }],
    ]

    ctx.session.listMessage = await ctx.reply(
      `Hi ${ctx.from.first_name || 'stranger'}.
${inline_keyboard.length > 1 ? '\nAvailable games:' : ''}`,
      { reply_markup: { inline_keyboard } },
    ).catch(debug)
  },
]
