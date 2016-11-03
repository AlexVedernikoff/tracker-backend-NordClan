const sequelize = require('../orm');
const Sequelize = require('sequelize');

const User = sequelize.define('users', {
    username: { type: Sequelize.STRING, allowNull: false },
    firstname_ru: { type: Sequelize.STRING, allowNull: false },
    lastname_ru: { type: Sequelize.STRING, allowNull: false },
    firstname_en: Sequelize.STRING,
    lastname_en: Sequelize.STRING,
    start_date: Sequelize.DATE,
    email: Sequelize.STRING,
    mobile: Sequelize.STRING,
    skype: Sequelize.STRING,
    photo: Sequelize.STRING,
    birthday: Sequelize.STRING,
    ps_id: Sequelize.STRING
  });

module.exports = User;
