const Sequelize = require('sequelize');
const config = require('../configs');

var sequelize = new Sequelize(config.db.postgres.name, config.db.postgres.username, config.db.postgres.password, {
      host: config.db.postgres.host,
      dialect: config.db.postgres.dialect,
      port:    config.db.postgres.port
    });

module.exports = sequelize;
