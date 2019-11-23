module.exports = () => [
  /^back|reverse|index$/,
  async (ctx) => {
    switch (ctx.match[0]) {
      case 'back':
        ctx.scene.leave()
        break

      default:
    }
    return ctx.answerCbQuery()
  },
]
