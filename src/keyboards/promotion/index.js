const { promotionMap } = require('@/helpers')

module.exports = ({ makeMoves, pressed }) => makeMoves.map(({ key }) => ({
  text: promotionMap[key[key.length - 1]],
  callback_data: `${pressed.file}${pressed.rank}${key[key.length - 1]}`,
}))
