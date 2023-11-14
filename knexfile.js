require('dotenv').config()

const {
  DB_HOST,
  DB_PORT,
  DB_CLIENT,
  DB_CHARSET,
  DB_DATABASE,
  DB_PASSWORD,
  DB_USERNAME,
  DB_MIGRATIONS_TABLE,
} = process.env

const params = DB_CLIENT === 'sqlite3'
  ? {
    filename: DB_DATABASE,
  }
  : {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_DATABASE,
    user: DB_USERNAME,
    password: DB_PASSWORD,
  }

module.exports = {
  client: DB_CLIENT,
  connection: {
    ...params,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: DB_MIGRATIONS_TABLE,
  },
}
