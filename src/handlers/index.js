const gamesHandler = require('./games')
const startHandler = require('./start')
const fenMoveHandler = require('./fenMove')
const mainMenuHandler = require('./mainMenu')
const fenListenHandler = require('./fenListen')
const inlineBackHandler = require('./inlineBack')
const inlineJoinHandler = require('./inlineJoin')
const inlineMoveHandler = require('./inlineMove')
const inlineLastTurn = require('./inlineLastTurn')
const inlineQueryHandler = require('./inlineQuery')
const inlineSettingsHandler = require('./inlineSettings')

module.exports = {
  gamesHandler,
  startHandler,
  fenMoveHandler,
  inlineLastTurn,
  mainMenuHandler,
  fenListenHandler,
  inlineBackHandler,
  inlineJoinHandler,
  inlineMoveHandler,
  inlineQueryHandler,
  inlineSettingsHandler,
}
