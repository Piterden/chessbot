/* eslint-disable no-unused-vars */

exports.up = async (knex, Promise) => (await knex.schema.hasTable('games'))
  ? null
  : knex.schema.createTable('games', (table) => {
    table.increments('id')
    table.bigInteger('whites_id').unsigned().notNullable().index().references('id').inTable('users')
    table.bigInteger('blacks_id').unsigned().notNullable().index().references('id').inTable('users')
    table.string('inline_id').notNullable().unique().index()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.text('config').defaultTo('{}')
  })

exports.down = async (knex, Promise) => (await knex.schema.hasTable('games'))
  ? knex.schema.dropTable('games')
  : null
