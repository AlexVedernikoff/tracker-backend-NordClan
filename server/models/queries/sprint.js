const models = require('../');

exports.name = 'sprint';

exports.allSprintsByProject = function (projectId, attributes = ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime', 'createdAt', 'deletedAt',
  'projectId', 'authorId', 'budget', 'riskBudget',
  [models.Sequelize.literal(`(SELECT sum(t.fact_execution_time)
                                FROM tasks as t
                                WHERE t.sprint_id = "Sprint"."id"
                                AND t.deleted_at IS NULL)`), 'spentTime'], // Потраченное время на спринт
  [models.Sequelize.literal(`(SELECT count(*)
                                FROM tasks as t
                                WHERE t.sprint_id = "Sprint"."id"
                                AND t.deleted_at IS NULL
                                AND t.status_id <> ${models.TaskStatusesDictionary.CANCELED_STATUS})`), 'countAllTasks'], // Все задачи кроме отмененных
  [models.Sequelize.literal(`(SELECT count(*)
                                FROM tasks as t
                                WHERE t.sprint_id = "Sprint"."id"
                                AND t.deleted_at IS NULL
                                AND t.status_id in (${models.TaskStatusesDictionary.DONE_STATUSES}))`), 'countDoneTasks'] // Все сделанные задаче
], t = null) {

  const result = [];
  return models.Sprint
    .findAll({
      attributes: attributes,
      where: {
        projectId: projectId,
        deletedAt: null
      },
      order: [
        ['factStartDate', 'ASC'],
        ['name', 'ASC']
      ],
      transaction: t
    })
    .then((model) => {
      model.forEach((elModel) => {
        result.push(elModel.dataValues);
      });
      return result;
    });

};

