import Scene from 'telegraf/scenes/base.js'

import {
  enterLobbyHandler,
  leaveLobbyHandler,
  newHandler,
  joinHandler,
} from '../handlers/index.js'

export default new Scene('lobby')
  .enter(...enterLobbyHandler())
  .leave(...leaveLobbyHandler())
  .action(...newHandler())
  .action(...joinHandler())
