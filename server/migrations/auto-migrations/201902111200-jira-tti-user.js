const moment = require('moment');

const user = {
  ldap_login: '',
  login: 'tti.simbirsoft',
  password: '',
  is_test: false,
  last_name_en: '',
  first_name_en: '',
  full_name_en: '',
  last_name_ru: '',
  first_name_ru: '',
  full_name_ru: '',
  active: 1,
  isActive: 1,
  photo: '',
  email_primary: '',
  skype: '',
  created_at: moment().toISOString(),
  updated_at: moment().toISOString()
};


module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [user]);
  },
  down: function (queryInterface) {
    queryInterface.delete(
      'users',
      { login: 'tti.simbirsoft' }
    );
  }
};

