/* eslint-disable no-unused-vars */

exports.up = async (knex, Promise) => (await knex.schema.hasTable('games'))
  ? null
  : knex.schema.createTable('games', (table) => {
    table.increments('id')
    table.biginteger('whites_id').unsigned().notNullable().references('id').inTable('users').index()
    table.biginteger('blacks_id').unsigned().notNullable().references('id').inTable('users').index()
    table.string('inline_id').notNullable().unique().index()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.text('config').defaultTo('{}')
  })

exports.down = async (knex, Promise) => (await knex.schema.hasTable('games'))
  ? knex.schema.dropTable('games')
  : null
