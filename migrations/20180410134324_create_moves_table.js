/* eslint-disable no-unused-vars */

exports.up = async (knex, Promise) => (await knex.schema.hasTable('moves'))
  ? null
  : knex.schema.createTable('moves', (table) => {
    table.increments('id')
    table.integer('game_id')
      .unsigned()
      .notNullable()
      .index()
      .references('id')
      .inTable('games')
    table.string('entry')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

exports.down = async (knex, Promise) => (await knex.schema.hasTable('moves'))
  ? knex.schema.dropTable('moves')
  : null
