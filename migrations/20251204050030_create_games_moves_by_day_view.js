/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.createView('games_moves_by_day', (view) => {
    view.columns([
      'dateval',
      'moves',
      'games',
    ])
    view.as(
      knex.raw(`
        SELECT
          "table1"."dateval" AS "dateval",
          "table1"."moves" AS "moves",
          "table2"."games" AS "games"
        FROM (
          (SELECT
            COUNT("M"."id") AS "moves",
            CAST("M"."created_at" AS date) AS "dateval"
          FROM "moves" "M"
          GROUP BY "dateval") "table1"
          JOIN
            (SELECT
              COUNT("G"."id") AS "games",
              CAST("G"."created_at" AS date) AS "dateval"
            FROM "games" "G"
            GROUP BY "dateval") "table2"
          ON ("table1"."dateval" = "table2"."dateval")
        )
        ORDER BY "dateval"
      `)
    )
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.dropView('games_moves_by_day')
};
