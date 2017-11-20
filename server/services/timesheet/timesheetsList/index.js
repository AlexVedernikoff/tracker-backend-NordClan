const timesheetRequest = require('./request');
const { Timesheet } = require('../../../models');

module.exports = () => {
  function createResponse (timesheets) {
    timesheets.forEach(model => {
      // переношу из задачи в корень объекта
      if (model.task && !model.dataValues.project) {
        model.dataValues.project = model.task.project.dataValues;
        delete model.task.project.dataValues;
      }
    });
    return timesheets;
  }

  return {
    call: async (dateBegin, dateEnd, userId, userPSId, isSystemUser) => {
      const request = timesheetRequest(dateBegin, dateEnd, userId, userPSId, isSystemUser);
      const timesheets = await Timesheet.findAll(request);
      return createResponse(timesheets);
    }
  };
};
