module.exports = () => [
  /^reverse|index$/,
  async (ctx) => {
    ctx.answerCbQuery()
  },
]
