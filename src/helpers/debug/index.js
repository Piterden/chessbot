const { inspect } = require('util')


const debug = (data) => console.log(inspect(data, {
  colors: true,
  showHidden: true,
  depth: 10,
}))

module.exports = debug
