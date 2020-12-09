module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.describeTable('test_plan').then(async attributes => {
      if (!attributes.project_id) {
        await queryInterface.addColumn('test_plan', 'project_id', {
          type: Sequelize.INTEGER,
          allowNull: false,
        });
      }
      return await queryInterface.renameTable('test_plan', 'test_run');
    });

    queryInterface.describeTable('test_plan_test_cases').then(async attributes => {
      if (attributes.test_plan_id) {
        await queryInterface.renameColumn('test_plan_test_cases', 'test_plan_id', 'test_run_id');
      }
      return await queryInterface.renameTable('test_plan_test_cases', 'test_run_test_cases');
    });

    queryInterface.describeTable('test_plan_histories').then(async attributes => {
      if (attributes.test_plan_id) {
        await queryInterface.renameColumn('test_plan_histories', 'test_plan_id', 'test_run_id');
      }
      return await queryInterface.renameTable('test_plan_histories', 'test_run_histories');
    });

    return queryInterface.describeTable('project_environment_test_plan').then(async attributes => {
      if (attributes.test_plan_id) {
        await queryInterface.renameColumn('project_environment_test_plan', 'test_plan_id', 'test_run_id');
      }
      return await queryInterface.renameTable('project_environment_test_plan', 'project_environment_test_run');
    });
  },

  down: queryInterface => {
    queryInterface.describeTable('test_run').then(async attributes => {
      if (attributes.project_id) {
        await queryInterface.removeColumn('test_run', 'project_id');
      }
      return await queryInterface.renameTable('test_run', 'test_plan');
    });

    queryInterface.describeTable('test_run_test_cases').then(async attributes => {
      if (attributes.test_run_id) {
        await queryInterface.renameColumn('test_run_test_cases', 'test_run_id', 'test_plan_id');
      }
      return await queryInterface.renameTable('test_run_test_cases', 'test_plan_test_cases');
    });

    queryInterface.describeTable('test_run_histories').then(async attributes => {
      if (attributes.test_run_id) {
        await queryInterface.renameColumn('test_run_histories', 'test_run_id', 'test_plan_id');
      }
      return await queryInterface.renameTable('test_run_histories', 'test_plan_histories');
    });

    return queryInterface.describeTable('project_environment_test_run').then(async attributes => {
      if (attributes.test_run_id) {
        await queryInterface.renameColumn('project_environment_test_run', 'test_run_id', 'test_plan_id');
      }
      return await queryInterface.renameTable('project_environment_test_run', 'project_environment_test_plan');
    });
  },
};
