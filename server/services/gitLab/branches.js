const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const { Task, TaskTypesDictionary, Project } = require('../../models/');
const createError = require('http-errors');

// tasktype/project-prefix-taskId
const createBranch = async function (taskId, repoId, sourceBranch = 'develop') {


  const taskTypesDictionary = await TaskTypesDictionary.findAll();
  const task = await Task.find({where: {id: taskId}, attributes: ['id', 'typeId', 'projectId']});
  const project = await Project.find({where: {id: task.projectId}, attributes: ['id', 'prefix']});

  if (!project.gitlabProjetIds.includes(repoId)) {
    throw createError(403, 'Access denied');
  }
  const taskType = taskTypesDictionary.find(i => i.id === task.typeId);

  const postData = {
    id: repoId,
    branch: `${taskType.toLowerCase()}/${project.prefix}-${task.id}`,
    ref: sourceBranch
  };
  return http.post({ host, path: `/projects/${repoId}/repository/branches`, headers}, postData);

  // проверка прикреплен ли репозиторий к проекту
};

module.exports = {
  createBranch
};

