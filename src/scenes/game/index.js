const Scene = require('telegraf/scenes/base')

const {
  movesHandler, startHandler, actionsHandler, leaveHandler, optionsHandler,
} = require('../../handlers')


module.exports = new Scene('game')
  .leave(...leaveHandler())
  .enter(...startHandler())
  .action(...optionsHandler())
  .action(...movesHandler())
  .action(...actionsHandler())
