const sequelize = require('./orm');
const { runHttpServer } = require('./httpServer');
const { runHttpsServer } = require('./httpsServer');

exports.run = function () {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });

  runHttpServer();
  runHttpsServer();
};
