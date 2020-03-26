const gamesHandler = require('./games')
const startHandler = require('./start')
const mainMenuHandler = require('./mainMenu')
const inlineBackHandler = require('./inlineBack')
const inlineJoinHandler = require('./inlineJoin')
const inlineMoveHandler = require('./inlineMove')
const inlineLastTurn = require('./inlineLastTurn')
const inlineQueryHandler = require('./inlineQuery')
const inlineSettingsHandler = require('./inlineSettings')

module.exports = {
  gamesHandler,
  startHandler,
  inlineLastTurn,
  mainMenuHandler,
  inlineBackHandler,
  inlineJoinHandler,
  inlineMoveHandler,
  inlineQueryHandler,
  inlineSettingsHandler,
}
