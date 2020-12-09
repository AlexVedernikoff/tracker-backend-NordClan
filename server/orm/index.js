const Sequelize = require('sequelize');
const config = require('../configs');

const sequelize = new Sequelize(
  config.db.postgres.name,
  config.db.postgres.username,
  config.db.postgres.password,
  {
    host: config.db.postgres.host,
    dialect: config.db.postgres.dialect,
    port: config.db.postgres.port,
    logging: false,
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    pool: {
      max: 30,
      min: 0,
      idle: 100000,
    },
  },
  {
    define: {
      underscored: true,
    },
  }
);

module.exports = sequelize;
