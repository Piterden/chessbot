export default () => [
  /^back|reverse|index$/,
  async (ctx) => {
    switch (ctx.match[0]) {
      case 'back':
        ctx.scene.enter('lobby')
        break

      default:
        break
    }
    return ctx.answerCbQuery()
  },
]
