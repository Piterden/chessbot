/* eslint-disable no-unused-vars */

exports.up = async (knex, Promise) => (await knex.schema.hasTable('games'))
  ? null
  : knex.schema.createTable('games', (table) => {
    table.increments('id')
    table.bigInteger('user_w').unsigned().nullable().index()
    table.bigInteger('user_b').unsigned().nullable().index()
    table.integer('board_w').unsigned().nullable()
    table.integer('board_b').unsigned().nullable()
    table.integer('actions_w').unsigned().nullable()
    table.integer('actions_b').unsigned().nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())

    table.foreign('user_w').references('id').on('users')
    table.foreign('user_b').references('id').on('users')
  })

exports.down = async (knex, Promise) => (await knex.schema.hasTable('games'))
  ? knex.schema.dropTable('games')
  : null
