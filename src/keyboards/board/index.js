const Telegraf = require('telegraf')

const { emodji } = require('../../helpers')


const { Markup } = Telegraf

module.exports = (board, isWhite) => {
  const horizontal = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const vertical = [8, 7, 6, 5, 4, 3, 2, 1] // eslint-disable-line no-magic-numbers

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
      ? { text: 'O', callback_data: `${col}${row}` }
      : { text: unescape('%u1160'), callback_data: `${col}${row}` }
  }))

  return Markup.inlineKeyboard(isWhite
    ? boardMarkup
    : boardMarkup.map((row) => row.reverse()).reverse()).extra()
}
