const models = require('../');

const queryAttributes = function (sprintSource, role) {
  return role !== models.User.EXTERNAL_USER_ROLE
    ? [
      'id', 'name', 'statusId', 'factStartDate', 'factFinishDate', /*'allottedTime', DEPRECATED*/ 'createdAt', 'deletedAt',
      'projectId', 'authorId', 'budget', 'riskBudget', 'qaPercent',
      [models.Sequelize.literal(`(SELECT sum(tsh.spent_time)
                                    FROM timesheets as tsh
                                    WHERE tsh.sprint_id = "${sprintSource}"."id")`), 'spentTime'], // Потраченное время на спринт
      [models.Sequelize.literal(`(SELECT count(*)
                                    FROM tasks as t
                                    WHERE t.sprint_id = "${sprintSource}"."id"
                                    AND t.deleted_at IS NULL
                                    AND t.status_id <> ${models.TaskStatusesDictionary.CANCELED_STATUS})`), 'countAllTasks'], // Все задачи кроме отмененных
      [models.Sequelize.literal(`(SELECT count(*)
                                    FROM tasks as t
                                    WHERE t.sprint_id = "${sprintSource}"."id"
                                    AND t.deleted_at IS NULL
                                    AND t.status_id in (${models.TaskStatusesDictionary.DONE_STATUSES}))`), 'countDoneTasks'], // Все сделанные задаче
    ]
    : [
      'id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'createdAt', 'deletedAt',
      'projectId', 'authorId', 'qaPercent',
      [models.Sequelize.literal(`(SELECT count(*)
                                    FROM tasks as t
                                    WHERE t.sprint_id = "${sprintSource}"."id"
                                    AND t.deleted_at IS NULL
                                    AND t.status_id <> ${models.TaskStatusesDictionary.CANCELED_STATUS})`), 'countAllTasks'], // Все задачи кроме отмененных
      [models.Sequelize.literal(`(SELECT count(*)
                                    FROM tasks as t
                                    WHERE t.sprint_id = "${sprintSource}"."id"
                                    AND t.deleted_at IS NULL
                                    AND t.status_id in (${models.TaskStatusesDictionary.DONE_STATUSES}))`), 'countDoneTasks'], // Все сделанные задаче
    ];
};

exports.name = 'sprint';
exports.queryAttributes = queryAttributes;

exports.allSprintsByProject = function (projectId, attributes = queryAttributes('Sprint'), t = null) {
  const result = [];
  return models.Sprint
    .findAll({
      attributes: attributes,
      where: {
        projectId: projectId,
        deletedAt: null,
      },
      order: [
        ['factStartDate', 'ASC'],
        ['name', 'ASC'],
      ],
      transaction: t,
    })
    .then((model) => {
      model.forEach((elModel) => {
        result.push(elModel.dataValues);
      });

      return result;
    });

};

