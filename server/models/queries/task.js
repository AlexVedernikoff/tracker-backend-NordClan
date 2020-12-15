const models = require('../');

exports.name = 'task';

const projectWithUsers = [
  {
    as: 'project',
    model: models.Project,
    attributes: ['id'],
    required: false,
    include: [
      {
        as: 'projectUsers',
        model: models.ProjectUsers,
        attributes: ['userId'],
      },
    ],
  },
];

exports.includeProjectWithUsers = projectWithUsers;

exports.getTaskWithUsers = function (id) {
  return models.Task
    .findOne({
      where: {
        deletedAt: null,
        id,
      },
      attributes: ['id'],
      include: projectWithUsers,
    });
};

exports.defaultAttributes = function (role) {
  if (role === models.User.EXTERNAL_USER_ROLE) {
    return {
      exclude: ['factExecutionTime', 'plannedExecutionTime'],
    };
  }

  return {
    include: [[models.Sequelize.literal(`(SELECT sum(tsh.spent_time)
                                          FROM timesheets as tsh
                                          WHERE tsh.task_id = "Task"."id")`), 'factExecutionTime']],
    exclude: ['factExecutionTime'],
  };
};
