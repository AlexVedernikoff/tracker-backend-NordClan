const moment = require('moment');

exports.createDraftMagicActivity = (instance, options) => {
  const draftModel = instance.$modelOptions.sequelize.models.TimesheetDraft;

  const draftsObjects = generateDrafts(instance);
  return draftModel.create(draftsObjects[0])
    .catch((e)=>{
      console.error(e);
      throw e;
    });

};

function generateDrafts(instance) {
  const currentDate = moment().format('YYYY-MM-DD');
  const magicActivities = instance.$modelOptions.sequelize.models.TimesheetTypesDictionary.magicActivities;
  let result = [];

  magicActivities.forEach((el) => {
    result.push({
      onDate: currentDate,
      projectId: instance.id,
      userId: instance.userId,
      typeId: el,
    });
  });

  return result;

}
