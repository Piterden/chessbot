const Telegraf = require('telegraf')

const { emodji } = require('@/helpers')

const { Markup } = Telegraf

module.exports = (board, isWhite, actions) => {
  const horizontal = 'abcdefgh'.split('')
  const vertical = Array.from({ length: 8 }).map((item, idx) => idx + 1).reverse()

  const boardMarkup = vertical.map((row) => horizontal.map((col) => {
    const square = board
      .find(({ file, rank }) => file === col && rank === row)

    if (square && square.piece) {
      return square.destination
        ? {
          text: `X${emodji[square.piece.side.name][square.piece.type]}`,
          callback_data: `${col}${row}`,
        }
        : {
          text: `${emodji[square.piece.side.name][square.piece.type]}`,
          callback_data: `${col}${row}`,
        }
    }

    return square.destination
      ? { text: 'O', callback_data: `${prefix}${col}${row}` }
      : { text: unescape('%u0020'), callback_data: `${prefix}${col}${row}` }
  }))

  const keyboard = isWhite
    ? boardMarkup
    : boardMarkup.map((row) => row.reverse()).reverse()

  if (actions) {
    keyboard.push(actions)
  }

  return Markup.inlineKeyboard(keyboard).extra()
}
