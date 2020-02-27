const Telegraf = require('telegraf')

const { emodji } = require('@/helpers')

const { Markup } = Telegraf

/**
 * Board generator function.
 *
 * @param {Array} board The board.
 * @param {Boolean} isWhite Indicates if it is action of a white side.
 * @param {Array[]} actions The additional buttons under the board.
 * @return {Extra}
 */
module.exports = (board, isWhite, actions) => {
  const horizontal = 'abcdefgh'.split('')
  const vertical = Array.from({ length: 8 }, (item, idx) => idx + 1).reverse()

  /**
   * Nested loops board generation.
   *
   * @type {Array}
   */
  let boardMarkup = vertical.map((row) => horizontal.map((col) => {
    /**
     * Find a pressed square.
     *
     * @type {Object}
     */
    const square = board
      .find(({ file, rank }) => file === col && rank === row)

    /**
     * If it is a piece.
     */
    if (square && square.piece) {
      const piece = emodji[square.piece.side.name][square.piece.type]

      return {
        text: `${square.destination ? 'X' : ''}${piece}`,
        callback_data: `${col}${row}`,
      }
    }

    /**
     * If it is an empty square.
     */
    return {
      text: square.destination ? '·' : unescape('%u0020'),
      callback_data: `${col}${row}`,
    }
  }))

  /**
   * Manage the rotation of a board.
   */
  if (!isWhite) {
    boardMarkup = boardMarkup.map((row) => row.reverse()).reverse()
  }

  /**
   * Attach additional buttons.
   */
  if (actions) {
    boardMarkup.push(actions)
  }

  /**
   * Returns an Extra object.
   */
  return Markup.inlineKeyboard(boardMarkup).extra()
}
