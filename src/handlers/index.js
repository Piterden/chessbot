const newHandler = require('./new')
const joinHandler = require('./games')
const loadHandler = require('./load')
const gamesHandler = require('./games')
const startHandler = require('./start')
const mainMenuHandler = require('./mainMenu')
const inlineBackHandler = require('./inlineBack')
const inlineJoinHandler = require('./inlineJoin')
const inlineMoveHandler = require('./inlineMove')
const inlineQueryHandler = require('./inlineQuery')
const inlineSettingsHandler = require('./inlineSettings')

module.exports = {
  newHandler,
  joinHandler,
  loadHandler,
  gamesHandler,
  startHandler,
  mainMenuHandler,
  inlineBackHandler,
  inlineJoinHandler,
  inlineMoveHandler,
  inlineQueryHandler,
  inlineSettingsHandler,
}
