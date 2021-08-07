const { debug, getOrCreateUser } = require('@/helpers')

// TODO remove eslint disable and use object after receiving payments for calculating enough flag
// eslint-disable-next-line no-unused-vars
const minimalAmount = {
  usd: 10,
  rub: 100,
  btc: 0.00005,
}

const isPayed = async ctx => {
  const payments = await ctx.db('payments').where({ user_id: ctx.from.id, enough: true })
  return Boolean(payments.length)
}

const pay = async ctx => {
  getOrCreateUser(ctx)
  ctx.db('payments').insert({
    user_id: ctx.from.id,
    transaction_id: 1,
    amount: 10,
    currency: 'usd',
    method: 'manual',
    enough: true,
  }).catch(debug)
  ctx.reply('You just paid 10 .usd')
}

module.exports = {
  isPayed,
  pay,
}
