const models = require('../');
const createError = require('http-errors');

exports.name = 'timesheetDraft';


/**
 * Поиск драфтшита по id
 */
exports.findDraftSheet = async function(userId, draftsheetId) {
  const draftsheetModel = await models.TimesheetDraft.findOne({
    required: true,
    where: {
      id: draftsheetId,
      userId: userId
    },
    attributes: ['id', 'typeId', 'onDate', 'statusId'],
  });
  if (!draftsheetModel) throw createError(404, 'User can\'t change draftsheet!');
  return draftsheetModel;
};
  