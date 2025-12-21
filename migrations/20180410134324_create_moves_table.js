export const up = async (knex) => (await knex.schema.hasTable('moves'))
  ? null
  : knex.schema.createTable('moves', (table) => {
    table.increments('id')
    table.integer('game_id').unsigned().notNullable()
    table.string('entry')
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table.foreign('game_id').references('id').on('games')
  })

export const down = async (knex) => (await knex.schema.hasTable('moves'))
  ? knex.schema.dropTable('moves')
  : null
