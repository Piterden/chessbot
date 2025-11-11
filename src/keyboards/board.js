import Telegraf from 'telegraf'
import { emodji } from '../helpers.js'

const { Markup } = Telegraf

export default (board, isWhite, actions) => {
  const horizontal = 'abcdefgh'.split('')
  const vertical = Array.from({ length: 8 }, (item, idx) => idx + 1).reverse()

  const boardMarkup = vertical.map((row) => horizontal.map((col) => {
    const square = board.find(({ file, rank }) => file === col && rank === row)
    const data = `${col}${row}`
    let text = ''

    if (square && square.piece) {
      const label = emodji[square.piece.side.name][square.piece.type]
      text = square.destination ? `X${label}` : `${label}`
      return Markup.callbackButton(text, data)
    }

    text = square.destination ? '·' : unescape('%u0020')
    return Markup.callbackButton(text, data)
  }))

  const keyboard = isWhite
    ? boardMarkup
    : boardMarkup.map((row) => row.reverse()).reverse()

  if (actions) {
    keyboard.push(actions)
  }

  return Markup.inlineKeyboard(keyboard).extra()
}
