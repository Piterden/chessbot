exports.up = async (knex, Promise) => (await knex.schema.hasTable('games'))
  ? knex.schema.table('games', (table) => {
    table.string('inline_id')
  })
  : null

exports.down = async (knex, Promise) => (await knex.schema.hasTable('games'))
  ? knex.schema.table('games', (table) => {
    table.dropColumn('inline_id')
  })
  : null
