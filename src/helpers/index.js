const debug = require('./debug')
const emodji = require('./emodji')

module.exports = {
  debug,
  emodji,

  unescapeUser: (user) => Object.keys(user).reduce((acc, key) => {
    acc[key] = typeof user[key] === 'string' ? unescape(user[key]) : user[key]
    return acc
  }, {}),

  escapeUser: (user) => Object.keys(user).reduce((acc, key) => {
    acc[key] = typeof user[key] === 'string' ? escape(user[key]) : user[key]
    return acc
  }, {}),
}
