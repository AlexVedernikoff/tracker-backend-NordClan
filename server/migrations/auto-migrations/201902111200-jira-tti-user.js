const { bcryptPromise } = require('../../components/utils');
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
  global_role: 'EXTERNAL_SERVICE',
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
    return bcryptPromise.hash(user.login)
      .then(password => { user.password = password; })
      .then(() =>
        queryInterface.sequelize.query(`
          ALTER TYPE global_role_type ADD VALUE 'EXTERNAL_SERVICE' AFTER 'USER';
          `))
      .then(() =>
        queryInterface.bulkInsert('users', [user])
      );
  },
  down: function (queryInterface) {
    return Promise.all([
      queryInterface.bulkDelete(
        'users',
        { login: 'tti.simbirsoft' }
      ),
      queryInterface.sequelize.query(`
       ALTER TABLE users
       ALTER COLUMN global_role DROP DEFAULT;
       ALTER TYPE global_role_type RENAME TO global_role_type_old;
       CREATE TYPE global_role_type AS ENUM ('ADMIN', 'VISOR', 'USER', 'EXTERNAL_USER', 'DEV_OPS');
       ALTER TABLE users ALTER COLUMN global_role TYPE global_role_type USING global_role::text::global_role_type;
       ALTER TABLE users ALTER COLUMN global_role SET DEFAULT 'USER'::global_role_type;
       DROP TYPE global_role_type_old;`)
    ]);
  }
};

