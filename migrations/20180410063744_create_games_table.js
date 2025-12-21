export const up = async (knex) => {
  if (await knex.schema.hasTable('games')) {
    return null
  }

  await knex.schema.createTable('games', (table) => {
    table.increments('id')
    table.bigInteger('user_w').unsigned().nullable().index()
    table.bigInteger('user_b').unsigned().nullable().index()
    table.integer('board_w').unsigned().nullable()
    table.integer('board_b').unsigned().nullable()
    table.integer('actions_w').unsigned().nullable()
    table.integer('actions_b').unsigned().nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at')

    table.foreign('user_w').references('id').on('users')
    table.foreign('user_b').references('id').on('users')
  })

  await knex.raw(`
    CREATE TRIGGER games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE PROCEDURE on_update();
  `)
}

export const down = async (knex) => (await knex.schema.hasTable('games'))
  ? knex.schema.dropTable('games')
  : null
