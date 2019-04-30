const Sequelize = require('sequelize')
const userModel = require('./user-model')
const {
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
//  DB_CLIENT, TODO
} = process.env
const DB_CLIENT = 'postgres' // knex use 'pg' client name
const connection = DB_CLIENT === 'sqlite' ? {
  storage: DB_HOST,
} : {
  host: DB_HOST,
  port: DB_PORT,
}

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  ...connection,
  dialect: DB_CLIENT,
})

const user = sequelize.define(...userModel)

// sequelize.sync()

module.exports = {
  sequelize, user,
}
