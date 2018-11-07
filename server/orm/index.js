const Sequelize = require('sequelize');
const sequelizeLogger = require('sequelize-log-syntax-colors');
const config = require('../configs');
const moment = require('moment');

const sequelize = new Sequelize(
  config.db.postgres.name,
  config.db.postgres.username,
  config.db.postgres.password,
  {
    host: config.db.postgres.host,
    dialect: config.db.postgres.dialect,
    port: config.db.postgres.port,
    logging: function (text) {
      sequelizeLogger(
        `${moment().format('YYYY-MM-DD HH:mm:ss:SSS')} - ${text}`
      );
    },
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    pool: {
      max: 30,
      min: 0,
      idle: 100000
    }
  },
  {
    define: {
      underscored: true
    }
  }
);

module.exports = sequelize;
