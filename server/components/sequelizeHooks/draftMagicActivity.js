/* Управление созданием и удалением магических активностей */


exports.createDraftMagicActivity = (instance, options) => {
  const draftModel = instance.$modelOptions.sequelize.models.TimesheetDraft;
  const draftsObjects = generateDrafts(instance);

  /*почему не работает bulkCreate, по этому Promise.all*/
  return Promise.all(draftsObjects.map((el) => {
    return draftModel.create(el, { transaction: options.transaction});
  }))
    .catch((e)=>{
      throw e;
    });

};

exports.destroyDraftMagicActivity = (instance, options) => {
  const draftModel = instance.$modelOptions.sequelize.models.TimesheetDraft;

  return draftModel.destroy({
    where: {
      projectId: instance.projectId,
      userId: instance.userId
    }
  });
};

function generateDrafts (instance) {
  const magicActivities = instance.$modelOptions.sequelize.models.TimesheetTypesDictionary.findAll({
    isMagicActivity: true
  });

  return magicActivities.map((el) => ({
    projectId: instance.projectId,
    userId: instance.userId,
    typeId: el
  }));
}
