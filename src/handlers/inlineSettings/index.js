const {
  debug,
  getGame,
  isWhiteUser,
  isBlackUser,
} = require('@/helpers')

module.exports = () => [
  /^settings::(\d+)(?:::(\w+))?(?:::(\w+))?$/,
  async (ctx) => {
    const game = await getGame(ctx, ctx.match[1])

    if (game === null) {
      // TODO add function to say user about error
      return
    }

    if (!isBlackUser(game, ctx) && !isWhiteUser(game, ctx)) {
      return ctx.answerCbQuery('Sorry, this game is busy. Try to make a new one.')
    }

    switch (ctx.match[2]) {
      case 'rotation':
        switch (ctx.match[3]) {
          case 'whites':
          case 'blacks':
          case 'dynamic':
            if (game) {
              const config = JSON.parse(game.config) || {}
              config.rotation = ctx.match[3]

              await ctx.db('games')
                .update({ config: JSON.stringify(config) })
                .where('id', game.id)
                .catch(debug)
            }

            return ctx.answerCbQuery(`You choose ${ctx.match[3]} rotation mode. It will be applied after the next turn.`)

          default:
            await ctx.editMessageReplyMarkup({
              inline_keyboard: [
                [{
                  text: 'Whites at bottom',
                  callback_data: `settings::${game.id}::rotation::whites`,
                }],
                [{
                  text: 'Blacks at bottom',
                  callback_data: `settings::${game.id}::rotation::blacks`,
                }],
                [{
                  text: 'Current mover at bottom',
                  callback_data: `settings::${game.id}::rotation::dynamic`,
                }],
                [{
                  text: '⬅️ Back to settings',
                  callback_data: `settings::${game.id}`,
                }],
              ],
            }).catch(debug)

            return ctx.answerCbQuery('Please choose a rotation mode!')
        }

      default:
        await ctx.editMessageReplyMarkup({
          inline_keyboard: [
            [{
              text: 'Board Rotation',
              callback_data: `settings::${game.id}::rotation`,
            }],
            [{
              text: '⬅️ Back to game',
              callback_data: `back::${game.id}`,
            }],
          ],
        }).catch(debug)

        return ctx.answerCbQuery('Please choose a setting you want to change!')
    }
  },
]
