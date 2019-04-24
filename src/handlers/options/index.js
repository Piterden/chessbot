const { actions } = require('@/keyboards')

module.exports = () => [
  /^options\/(show|hide)$/,
  async (ctx) => {
    let open

    switch (ctx.match[1]) {
      case 'show': open = true
        break
      case 'hide': open = false
        break
      default:
    }

    await ctx.editMessageReplyMarkup(actions(open).reply_markup)
  },
]
