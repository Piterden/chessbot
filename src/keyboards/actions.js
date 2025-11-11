import Telegraf from 'telegraf'

const { Markup } = Telegraf

export default (open = false) => Markup.inlineKeyboard([
  [
    Markup.callbackButton('◀️ Back to Games List', 'back'),
    Markup.callbackButton('Game Options 🔽', 'options/show', open),
    Markup.callbackButton('Game Options 🔼', 'options/hide', !open),
  ],
  [
    Markup.callbackButton('Rename Game', 'reverse', !open),
    Markup.callbackButton('Index', 'index', !open),
  ],
  [
    Markup.callbackButton('Game History', 'history', !open),
    Markup.callbackButton('Show Last Move', 'last', !open),
  ],
]).extra()
