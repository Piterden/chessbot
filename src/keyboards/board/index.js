const Telegraf = require('telegraf')

const { emodji } = require('../../helpers')


const { Markup } = Telegraf

const reversed = (markup) => markup.map((row) => row.reverse()).reverse()

const result = (board, isWhite) => {
  const horizontal = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const vertical = [1, 2, 3, 4, 5, 6, 7, 8] // eslint-disable-line no-magic-numbers

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
      : { text: '_', callback_data: `${col}${row}` }
  }))

  return Markup.inlineKeyboard(isWhite ? reversed(boardMarkup) : boardMarkup)
    .extra()
}

module.exports = result
