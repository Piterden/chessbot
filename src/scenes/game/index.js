const Scene = require('telegraf/scenes/base')

const {
  leaveHandler,
  movesHandler,
  startHandler,
  actionsHandler,
  messageHandler,
  optionsHandler,
} = require('@/handlers')

module.exports = new Scene('game')
  .leave(...leaveHandler())
  .enter(...startHandler())
  .action(...optionsHandler())
  .action(...movesHandler())
  .action(...actionsHandler())
  .on(...messageHandler())
