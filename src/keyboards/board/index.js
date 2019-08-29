const Telegraf = require('telegraf')

const { emodji } = require('@/helpers')

const { Markup } = Telegraf

module.exports = (board, isWhite, actions) => {
  const horizontal = 'abcdefgh'.split('')
  const vertical = Array.from({ length: 8 }, (item, idx) => idx + 1).reverse()

  let boardMarkup = vertical.map((row) => horizontal.map((col) => {
    const square = board
      .find(({ file, rank }) => file === col && rank === row)

    if (square && square.piece) {
      const piece = emodji[square.piece.side.name][square.piece.type]

      return {
        text: `${square.destination ? 'X' : ''}${piece}`,
        callback_data: `${col}${row}`,
      }
    }

    return {
      text: square.destination ? 'O' : unescape('%u0020'),
      callback_data: `${col}${row}`,
    }
  }))

  if (!isWhite) {
    boardMarkup = boardMarkup.map((row) => row.reverse()).reverse()
  }

  if (actions) {
    boardMarkup.push(actions)
  }

  return Markup.inlineKeyboard(boardMarkup).extra()
}
