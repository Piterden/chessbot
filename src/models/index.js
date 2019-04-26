const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DB_STRING)
sequelize.sync()

module.exports = {
  sequelize,
}
