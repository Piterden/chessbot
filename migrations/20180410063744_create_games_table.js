/* eslint-disable no-unused-vars */
/* eslint-disable no-magic-numbers */

exports.up = async (knex, Promise) => await knex.schema.hasTable('games')
  ? null
  : knex.schema.createTable('games', (table) => {
    table.bigInteger('id').unique()
    table.bigInteger('opponent').default(0)
    table.timestamps(['created_at', 'updated_at'])

    table.primary('id')
  })

exports.down = async (knex, Promise) => await knex.schema.hasTable('games')
  ? knex.schema.dropTable('games')
  : null
