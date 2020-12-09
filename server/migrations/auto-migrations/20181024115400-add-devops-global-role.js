module.exports = {
  up: function (queryInterface) {
    return queryInterface.sequelize.query(`
    ALTER TYPE global_role_type ADD VALUE 'DEV_OPS' AFTER 'USER';
    `);
  },
  down: function (queryInterface) {
    return queryInterface.sequelize.query(`
     ALTER TABLE users
     ALTER COLUMN global_role DROP DEFAULT;
     ALTER TYPE global_role_type RENAME TO global_role_type_old;
     CREATE TYPE global_role_type AS ENUM ('ADMIN', 'VISOR', 'USER', 'EXTERNAL_USER');
     ALTER TABLE users ALTER COLUMN global_role TYPE global_role_type USING global_role::text::global_role_type;
     ALTER TABLE users ALTER COLUMN global_role SET DEFAULT 'USER'::global_role_type;
     DROP TYPE global_role_type_old;
    `);
  },
};
