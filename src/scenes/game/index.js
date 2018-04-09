// const Stage = require('telegraf/stage')
// const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')

const { movesHandler, startHandler, actionsHandler } = require('../../handlers')


module.exports = new Scene('game')
  .enter(...startHandler())
  .action(...movesHandler())
  .action(...actionsHandler())
