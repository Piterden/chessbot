export const up = async (knex) => (await knex.schema.hasTable('users'))
  ? null
  : knex.schema.createTable('users', (table) => {
    table.bigInteger('id').unsigned()
    table.string('first_name')
    table.string('last_name')
    table.string('username')
    table.string('language_code')
    table.boolean('is_bot')
    table.boolean('is_premium')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at')

    table.primary('id')
  })

export const down = async (knex) => (await knex.schema.hasTable('users'))
  ? knex.schema.dropTable('users')
  : null
