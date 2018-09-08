const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const { Task, TaskTypesDictionary, Project } = require('../../models/');
const { getProject } = require('./projects');

const createBranch = async function (taskId, repoId, branchSource = 'develop', branchName) {


  const taskTypesDictionary = await TaskTypesDictionary.findAll();
  const task = await Task.find({where: {id: taskId}, attributes: ['id', 'typeId', 'projectId', 'gitlabBranchIds']});
  const project = await Project.find({where: {id: task.projectId}, attributes: ['id', 'prefix', 'gitlabProjectIds']});

  if (!project.gitlabProjectIds.includes(+repoId)) {
    throw new Error(400, 'Bad request');
  }
  const taskType = taskTypesDictionary.find(i => i.id === task.typeId);

  const postData = {
    branch: branchName || `${taskType.nameEn.toLowerCase().search(/feature/g) ? 'feature' : 'bug'}/${project.prefix}-${task.id}`,
    ref: branchSource
  };
  try {
    const branch = await http.post({ host, path: `/api/v4/projects/${repoId}/repository/branches`, headers}, postData);
    if (task.gitlabBranchIds instanceof Array) {
      task.gitlabBranchIds.push({[repoId]: branch.name});
    } else {
      task.gitlabBranchIds = [{[repoId]: branch.name}];
    }
    await task.set('gitlabBranchIds', task.gitlabBranchIds);
    await task.save();
    return branch;
  } catch (e) {
    throw new Error(400, 'Can not create branch');
  }
};

const getBranchesByTaskId = async function (taskId) {
  const task = await Task.find({where: {id: taskId}, attributes: ['id', 'projectId', 'gitlabBranchIds']});
  const repoBranchAssociation = {};
  task.gitlabBranchIds.map(e => {
    if (repoBranchAssociation[Object.keys(e)[0]]) {
      repoBranchAssociation[Object.keys(e)[0]].push(Object.values(e)[0]);
    } else {
      repoBranchAssociation[Object.keys(e)[0]] = [Object.values(e)[0]];
    }
  });

  const res = await Promise.all(Object.keys(repoBranchAssociation).map(async (e) => {
    const project = await getProject(e);
    const branches = await http.get({ host, path: `/api/v4/projects/${e}/repository/branches?search[name]=${repoBranchAssociation[e].join(',')}`, headers });
    return {project, branches};
  }));

  return res;

};

module.exports = {
  createBranch,
  getBranchesByTaskId
};

