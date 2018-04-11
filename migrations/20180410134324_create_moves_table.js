/* eslint-disable no-unused-vars */
/* eslint-disable no-magic-numbers */

exports.up = async (knex, Promise) => await knex.schema.hasTable('moves')
  ? null
  : knex.schema.createTable('moves', (table) => {
    table.increments('id')
    table.integer('game_id').unsigned().notNullable()
    table.string('move')
    table.timestamp('created_at')
  })

exports.down = async (knex, Promise) => await knex.schema.hasTable('moves')
  ? knex.schema.dropTable('moves')
  : null
