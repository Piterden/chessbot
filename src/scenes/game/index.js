const Scene = require('telegraf/scenes/base')

const {
  movesHandler,
  startHandler,
  actionsHandler,
  leaveHandler,
} = require('@/handlers')

module.exports = new Scene('game')
  .leave(...leaveHandler())
  .enter(...startHandler())
  .action(...movesHandler())
  .action(...actionsHandler())
