const Sequelize = require('sequelize')
const userModel = require('./user-model')
const { DB_DATABASE, DB_USERNAME, DB_PASSWORD } = process.env

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  dialect: 'postgres',
})

const user = sequelize.define(...userModel)

sequelize.sync()

module.exports = {
  sequelize, user,
}
