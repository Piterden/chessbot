/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.createView('users_by_lang', (view) => {
    view.columns([
      'users',
      'language_code',
    ])
    view.as(
      knex.raw(`
        select
          count("U"."id") AS "users",
          "U"."language_code" AS "language_code"
        from "users" "U"
        group by "U"."language_code"
        order by "users" desc
      `)
    )
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  knex.dropView('users_by_lang')
};
