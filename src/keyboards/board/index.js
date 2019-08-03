const Telegraf = require('telegraf')

const { emodji, letters } = require('@/helpers')

const { Markup } = Telegraf
const lang = { emodji, letters }

/**
 * Makes a board markup
 *
 * @param  {Object} board The board
 * @param  {Boolean} isWhite Indicates if white
 * @param  {Object[]} actions The actions
 * @param  {String}  [suffix=''] The suffix (default: '')
 * @return {Object}
 */
module.exports = (board, isWhite, actions, suffix = '') => {
  const horizontal = 'abcdefgh'.split('')
  const vertical = Array.from({ length: 8 }, (item, idx) => idx + 1).reverse()

  const boardMarkup = vertical.map((row) => horizontal.map((col) => {
    const square = board
      .find(({ file, rank }) => file === col && rank === row)

    if (square && square.piece) {
      return square.destination
        ? {
          text: `X${lang.emodji[square.piece.side.name][square.piece.type]}`,
          callback_data: `${col}${row}${suffix}`,
        }
        : {
          text: `${lang.emodji[square.piece.side.name][square.piece.type]}`,
          callback_data: `${col}${row}${suffix}`,
        }
    }

    return square.destination
      ? { text: 'O', callback_data: `${col}${row}${suffix}` }
      : { text: unescape('%u0020'), callback_data: `${col}${row}${suffix}` }
  }))

  const keyboard = isWhite
    ? boardMarkup
    : boardMarkup.map((row) => row.reverse()).reverse()

  if (actions) {
    keyboard.push(actions)
  }

  return Markup.inlineKeyboard(keyboard).extra()
}
