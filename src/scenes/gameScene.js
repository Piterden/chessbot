import Scene from 'telegraf/scenes/base.js'

import {
  enterGameHandler,
  leaveGameHandler,
  movesHandler,
  actionsHandler,
  messageHandler,
  optionsHandler,
} from '../handlers/index.js'

export default new Scene('game')
  .leave(...leaveGameHandler())
  .enter(...enterGameHandler())
  .action(...optionsHandler())
  .action(...movesHandler())
  .action(...actionsHandler())
  .on(...messageHandler())
