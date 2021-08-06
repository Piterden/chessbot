const { debug } = require('@/helpers')
const minimalAmount = {
  usd: 10,
  rub: 100,
  btc: 0.00005,
}

const isPayed = async ctx => {
  const payments = await ctx.db('payments').where({ user_id: ctx.from.id })
  return payments.some(payment => payment.amount >= minimalAmount[payment.currency])
}

const pay = async ctx => {
  let user = await ctx.db('users')
    .where({ id: ctx.from.id })
    .first()
    .catch(debug)

  if (!user) {
    await ctx.db('users').insert(ctx.from).catch(debug)
    user = await ctx.db('users').where('id', ctx.from.id).first().catch(debug)
  }
  console.log('paying')
  ctx.db('payments').insert({
    user_id: ctx.from.id,
    transaction_id: 1,
    amount: 10,
    currency: 'usd',
    method: 'manual',
  }).catch(debug)
}

module.exports = {
  isPayed,
  pay,
}
