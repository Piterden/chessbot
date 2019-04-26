const Sequelize = require('sequelize')

const { DB_DATABASE, DB_USERNAME, DB_PASSWORD } = process.env

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD).sync()

module.exports = {
  sequelize,
}
