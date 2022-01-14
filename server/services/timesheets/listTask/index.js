const { Timesheet } = require('../../../models');
const models = require('../../../models');

exports.listTask = async (taskId, isSystemUser) => {
  const timesheets = await Timesheet.findAll({
    where: {
      taskId,
      spentTime: {
        gt: 0,
      },
    },
    order: [
      ['on_date', 'DESC'],
    ],
    include: [
      {
        as: 'user',
        model: models.User,
        required: false,
        attributes: ['id', 'full_name_ru', 'photo'],
        paranoid: false,
      },
    ],
  });
  return timesheets;
};
