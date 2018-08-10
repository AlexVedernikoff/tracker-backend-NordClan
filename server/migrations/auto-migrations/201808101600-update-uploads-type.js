module.exports = {
  up: function (queryInterface) {
    return queryInterface.sequelize.query(`
    ALTER TABLE public.task_attachments
          ALTER COLUMN "type" TYPE character varying(80),
          ALTER COLUMN "type" SET NOT NULL; 
    ALTER TABLE public.project_attachments
          ALTER COLUMN "type" TYPE character varying(80),
          ALTER COLUMN "type" SET NOT NULL
    `);
  },
  down: function (queryInterface) {
    return queryInterface.sequelize.query(`
      ALTER TABLE task_attachemnts
            ALTER COLUMN "type" TYPE character varying(20),
            ALTER COLUMN "type" SET NOT NULL; 
      ALTER TABLE public.project_attachments
            ALTER COLUMN "type" TYPE character varying(20),
            ALTER COLUMN "type" SET NOT NULL
    `);
  }
};
