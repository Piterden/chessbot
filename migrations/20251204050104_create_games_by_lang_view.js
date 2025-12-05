/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.createView('games_moves_by_day', (view) => {
    view.columns([
      'gamesum',
      'lang',
    ])
    view.as(
      knex.raw(`
        select
          sum("T"."games") AS "gamesum",
          "T"."lang" AS "lang"
        from (
          select
            count("G"."id") AS "games",
            "U"."language_code" AS "lang"
          from "games" "G"
          left join "users" "U"
          on (("U"."id" = "G"."whites_id"))
          group by "lang"
        union
          select
            count("G"."id") AS "games",
            "U"."language_code" AS "lang"
          from "games" "G"
          left join "users" "U"
          on (("U"."id" = "G"."blacks_id"))
          group by "lang"
        ) "T"
        group by "T"."lang"
        order by "gamesum" desc
      `)
    )
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  knex.dropView('games_moves_by_day')
};
