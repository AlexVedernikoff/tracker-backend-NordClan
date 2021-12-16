const createError = require('http-errors');
const StringHelper = require('../../../components/StringHelper');
const models = require('../../../models');

const modifyEntityName = entityName => {
  const isSingleWord = !entityName.includes('-');
  return isSingleWord
    ? StringHelper.firstLetterUp(entityName)
    : StringHelper.upFirstLettersMultipleWords(entityName);
};

exports.status = function (req, res, next){
  if (!req.params.entity) return next(createError(400, 'entity need'));
  if (['project', 'sprint', 'task', 'timesheet', 'test-case'].indexOf(req.params.entity) === -1) return next(createError(400, 'entity must be only \'project\', \'sprint\', \'test-case\', or \'task\''));
  const modelName = modifyEntityName(req.params.entity) + 'StatusesDictionary';
  return models[modelName]
    .findAll()
    .then(data => res.json(data));
};

exports.projectRoles = function (req, res){
  return models.ProjectRolesDictionary
    .findAll()
    .then(data => res.json(data));
};

exports.timesheetTypes = function (req, res){
  return models.TimesheetTypesDictionary
    .findAll()
    .then(data => res.json(data));
};

exports.taskTypes = function (req, res){
  return models.TaskTypesDictionary
    .findAll()
    .then(data => res.json(data));
};

exports.projectTypes = function (req, res){
  return models.ProjectTypesDictionary
    .findAll()
    .then(data => res.json(data));
};

exports.milestoneTypes = function (req, res){
  return models.MilestoneTypesDictionary
    .findAll({
      order: [['id', 'ASC']],
    })
    .then(data => res.json(data));
};

exports.departments = async function (req, res, next){
  const dateBegin = req.query.dateBegin;
  const dateEnd = req.query.dateEnd;

  if (dateBegin && dateEnd) {
    req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
    req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return next(createError(400, validationResult));
    }
    return models.Department
      .findAll({
        where: {
          created_at: {
            $lte: dateEnd,
          },
          deleted_at: {
            $or: [{$gte: dateEnd}, {$eq: null}],
          },

        },
      })
      .then(data => res.json(data));
  }

  return models.Department
    .findAll()
    .then(data => res.json(data));
};

exports.testCaseSeverity = function (req, res) {
  return models.TestCaseSeverityDictionary
    .findAll()
    .then(data => res.json(data));
};

