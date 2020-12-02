const moment = require('moment');
const { bcryptPromise } = require('../../components/utils');

const user = {
  ldap_login: 'noLdapLogin',
  login: 'ivan-sinitsyn-sorokin',
  password: '',
  is_test: true,
  last_name_en: 'Sinitsyn-Sorokin',
  first_name_en: 'Ivan',
  full_name_en: 'Ivan Sinitsyn-Sorokin',
  last_name_ru: 'Синицын-Сорокин',
  first_name_ru: 'Иван',
  full_name_ru: 'Иван Синицын-Сорокин',
  active: 1,
  isActive: 1,
  photo: '',
  email_primary: 'ivan-sinitsyn-sorokin@simbirsoft.com',
  skype: '',
  created_at: moment().toISOString(),
  updated_at: moment().toISOString()
};

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn(
      'users',
      'is_test',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    )
      .then(() => {
        return bcryptPromise.hash('ivan-sinitsyn-simbirsoft')
          .then((password) => {
            user.password = password;
          });
      })
      .then(() => {
        return queryInterface.bulkInsert('users', [user]);
      });
  },
  down: function (queryInterface) {
    return Promise.all([
      queryInterface.removeColumn(
        'users',
        'is_test'
      ),
      queryInterface.bulkDelete(
        'users',
        { login: user.login }
      )
    ]);
  }
};
