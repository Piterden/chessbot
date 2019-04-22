const {
  DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_CHARSET,
  DB_MIGRATIONS_TABLE, NODE_ENV,
} = process.env

const dbConfigProd = {
  client: 'pg',
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
}

const dbConfigDev = {
  client: 'sqlite3',
  connection: {
    filename: DB_DATABASE,
    charset: DB_CHARSET,
  },
  migrations: {
    tableName: DB_MIGRATIONS_TABLE,
  },
}

const config = {
  development: dbConfigDev,
  production: dbConfigProd,
}

module.exports = config[NODE_ENV || 'production']
