/* eslint-disable no-unused-vars */
/* eslint-disable no-magic-numbers */

exports.up = async (knex, Promise) => await knex.schema.hasTable('games')
  ? null
  : knex.schema.createTable('games', (table) => {
    table.increments('id')
    table.bigInteger('user_w').unsigned().nullable().index()
    table.bigInteger('user_b').unsigned().nullable().index()
    // table.timestamps(['created_at', 'updated_at'], true)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.bigInteger('board_w').unsigned().nullable().unique()
    table.bigInteger('board_b').unsigned().nullable().unique()
    table.bigInteger('actions_w').unsigned().nullable().unique()
    table.bigInteger('actions_b').unsigned().nullable().unique()
  })

exports.down = async (knex, Promise) => await knex.schema.hasTable('games')
  ? knex.schema.dropTable('games')
  : null
