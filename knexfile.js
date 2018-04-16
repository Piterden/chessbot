require('dotenv').load()


const {
  DB_CLIENT, DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_CHARSET,
  DB_MIGRATIONS_TABLE,
} = process.env

module.exports = {
  development: {
    client: DB_CLIENT,
    connection: {
      database: DB_DATABASE,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      charset: DB_CHARSET,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: DB_MIGRATIONS_TABLE,
    },
  },

  staging: {
    client: DB_CLIENT,
    connection: {
      database: DB_DATABASE,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      charset: DB_CHARSET,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: DB_MIGRATIONS_TABLE,
    },
  },

  production: {
    client: DB_CLIENT,
    connection: {
      database: DB_DATABASE,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      charset: DB_CHARSET,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: DB_MIGRATIONS_TABLE,
    },
  },
}
