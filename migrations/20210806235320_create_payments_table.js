/* eslint-disable no-unused-vars */

exports.up = async (knex, Promise) => (await knex.schema.hasTable('payments'))
  ? null
  : knex.schema.createTable('payments', (table) => {
    table.increments('id')
    table.bigInteger('user_id').unsigned().notNullable().index().references('id').inTable('users')
    table.decimal('amount', 15, 2).notNullable()
    table.string('currency').notNullable()
    table.string('method').notNullable()
    table.string('transaction_id')
    table.boolean('enough').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

exports.down = async (knex, Promise) => (await knex.schema.hasTable('payments'))
  ? knex.schema.dropTable('payments')
  : null
