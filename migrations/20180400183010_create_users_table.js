/* eslint-disable no-unused-vars */

exports.up = async (knex, Promise) => (await knex.schema.hasTable('users'))
  ? null
  : knex.schema.createTable('users', (table) => {
    table.biginteger('id').unsigned()
    table.boolean('is_bot')
    table.string('first_name')
    table.string('last_name')
    table.string('username')
    table.string('language_code')
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table.primary('id')
  })

exports.down = async (knex, Promise) => (await knex.schema.hasTable('users'))
  ? knex.schema.dropTable('users')
  : null
