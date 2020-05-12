const createError = require('http-errors');
const StringHelper = require('../../../components/StringHelper');
const models = require('../../../models');

exports.status = function (req, res, next){
  if (!req.params.entity) return next(createError(400, 'entity need'));
  if (['project', 'sprint', 'task', 'timesheet'].indexOf(req.params.entity) === -1) return next(createError(400, 'entity must be only \'project\', \'sprint\' or \'task\''));
  const modelName = StringHelper.firstLetterUp(req.params.entity) + 'StatusesDictionary';
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
      order: [['id', 'ASC']]
    })
    .then(data => res.json(data));
};

exports.testCaseTypes = function (req, res) {
  return models.TestCaseTypesDictionary
    .findAll()
    .then(data => res.json(data));
};

exports.departments = function (req, res){
  return models.Department
    .findAll()
    .then(data => res.json(data));
};

