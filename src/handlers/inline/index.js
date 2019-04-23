const img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Starting_position_in_a_chess_game.jpg/1024px-Starting_position_in_a_chess_game.jpg'

module.exports = [
  'inline_query',
  async (ctx) => {
    console.log(ctx.from)
    return ctx.answerInlineQuery([
      { id: 1, type: 'article', thumb_url: img, title: 'Play',
       input_message_content: { message_text: 'hi' }, }
  	])
  },
]