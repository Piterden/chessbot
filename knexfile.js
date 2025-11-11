import dotenv from 'dotenv'

dotenv.config()

const {
  DB_HOST,
  DB_CLIENT,
  DB_DATABASE,
  DB_PASSWORD,
  DB_USERNAME,
  DB_MIGRATIONS_TABLE,
} = process.env

export default {
  client: DB_CLIENT,
  connection: {
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: DB_MIGRATIONS_TABLE,
  },
}
