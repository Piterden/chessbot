module.exports = () => [
  /^reverse|index$/,
  (ctx) => {
    ctx.answerCbQuery()
  },
]
