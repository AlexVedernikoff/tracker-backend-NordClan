const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const { Task, TaskTypesDictionary, Project } = require('../../models/');

const createBranch = async function (taskId, repoId, sourceBranch = 'develop') {


  const taskTypesDictionary = await TaskTypesDictionary.findAll();
  const task = await Task.find({where: {id: taskId}, attributes: ['id', 'typeId', 'projectId']});
  const project = await Project.find({where: {id: task.projectId}, attributes: ['id', 'prefix', 'gitlabProjectIds']});

  if (!project.gitlabProjectIds.includes(+repoId)) {
    throw new Error(400, 'Bad request');
  }
  const taskType = taskTypesDictionary.find(i => i.id === task.typeId);

  const postData = {
    branch: `${taskType.nameEn.toLowerCase().search(/feature/g) ? 'feature' : 'bug'}/${project.prefix}-${task.id}`,
    ref: sourceBranch
  };

  return http.post({ host, path: `/api/v4/projects/${repoId}/repository/branches`, headers}, postData);

};

module.exports = {
  createBranch
};

