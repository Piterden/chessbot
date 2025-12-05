/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.createView('statistic_per_day', (view) => {
    view.columns([
      'title',
      'average',
      'min',
      'max',
    ])
    view.as(
      knex.raw(`
        SELECT
          'games per day count' AS "title",
          TRUNC(AVG("P1"."games"),0) AS "average",
          MIN("P1"."games") AS "min",
          MAX("P1"."games") AS "max"
        FROM (
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
          JOIN (
            SELECT
              COUNT("G"."id") AS "games",
              CAST("G"."created_at" AS date) AS "dateval"
            FROM "games" "G"
            GROUP BY "dateval") "table2"
          on (("table1"."dateval" = "table2"."dateval")))
        ) "P1"
        WHERE
          (CAST("P1"."dateval" AS date) <> CAST((now() + interval '3 hours') AS date))
        GROUP BY "title"
      UNION
        SELECT
          'moves per day count' AS "title",
          TRUNC(AVG("P2"."moves"),0) AS "average",
          MIN("P2"."moves") AS "min",
          MAX("P2"."moves") AS "max"
        FROM (
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
          ON ("table1"."dateval" = "table2"."dateval"))
        ) "P2"
        WHERE
          (CAST("P2"."dateval" AS date) <> CAST((now() + interval '3 hours') AS date))
        GROUP BY "title"
      `)
    )
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  knex.dropView('statistic_per_day')
};
