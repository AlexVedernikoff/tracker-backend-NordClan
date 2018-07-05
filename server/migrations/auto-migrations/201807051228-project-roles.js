module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('project_roles', [
      {id: 12, code: 'android', name: 'Android'},
      {id: 13, code: 'ios', name: 'IOS'}
    ]);
  },

  down: (queryInterface, Sequalize) => {
    return (
      queryInterface.bulkDelete(
        'project_roles',
        { id: { [Sequalize.Op.in]: [12, 13] } }
      )
    );
  }
};
