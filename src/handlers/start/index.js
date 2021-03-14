const { mainMenu, debug } = require('@/helpers')

module.exports = () => async (ctx) => {
  await ctx.replyWithMarkdown(
    'To play chess with a friend, type @chessy\\_bot to your message input field.',
    { reply_markup: { inline_keyboard: mainMenu } },
  ).catch(debug)
}
