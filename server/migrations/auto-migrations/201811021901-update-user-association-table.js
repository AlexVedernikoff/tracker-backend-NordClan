module.exports = {
  up: function (queryInterface) {
    return queryInterface
      .changeColumn('user_email_association', 'internal_user_email', {
        type: 'INTEGER USING CAST("internal_user_email" as INTEGER)'
      })
      .then(() => {
        return queryInterface.renameColumn(
          'user_email_association',
          'internal_user_email',
          'internal_user_id'
        );
      });
  }
};
