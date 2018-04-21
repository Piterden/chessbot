require('dotenv').load()


const {
  DB_CLIENT, DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_CHARSET,
  DB_MIGRATIONS_TABLE, NODE_ENV,
} = process.env 

const config = {
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

module.exports = config[NODE_ENV]

