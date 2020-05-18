const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const { Task, TaskTypesDictionary, Project } = require('../../models/');
const { getProject } = require('./projects');

const createBranch = async function (taskId, repoId, branchSource, branchName) {
  const taskTypesDictionary = await TaskTypesDictionary.findAll();
  const task = await Task.find({
    where: { id: taskId },
    attributes: ['id', 'typeId', 'projectId', 'gitlabBranchIds']
  });
  const project = await Project.find({
    where: { id: task.projectId },
    attributes: ['id', 'prefix', 'gitlabProjectIds']
  });

  if (!project.gitlabProjectIds.includes(+repoId)) {
    throw new Error(400, 'Bad request');
  }
  const taskType = taskTypesDictionary.find(i => i.id === task.typeId);

  const postData = {
    branch:
      branchName
      || `${
        taskType.nameEn.toLowerCase().search(/feature/g) ? 'feature' : 'bug'
      }/${project.prefix}-${task.id}`,
    ref: branchSource
  };

  try {
    const branch = await http.post(
      { host, path: `/api/v4/projects/${repoId}/repository/branches`, headers },
      postData
    );
    if (task.gitlabBranchIds instanceof Array) {
      task.gitlabBranchIds.push({ [repoId]: branch.name });
    } else {
      task.gitlabBranchIds = [{ [repoId]: branch.name }];
    }
    await task.set('gitlabBranchIds', task.gitlabBranchIds);
    await task.save();
    const repo = await getProject(repoId);
    return { project: repo.name_with_namespace, branch: branch.name };
  } catch (e) {
    throw new Error(400, 'Can not create branch');
  }
};

const getBranchesByTaskId = async function (taskId) {
  const task = await Task.find({
    where: { id: taskId },
    attributes: ['id', 'projectId', 'gitlabBranchIds']
  });
  if (!task.gitlabBranchIds) {
    return [];
  }

  let projects = {};
  task.gitlabBranchIds.map(e => {
    projects = {
      ...projects,
      ...Object.keys(e)
    };
  });

  projects = await Promise.all(
    Object.values(projects).map(pId => {
      return getProject(pId);
    })
  );

  const res = task.gitlabBranchIds.map(el => {
    let r;
    projects.map(p => {
      if (el[p.id]) {
        r = { project: p.name_with_namespace, branch: el[p.id] };
      }
    });
    return r;
  });
  return res;
};

const getBranchesByRepoId = async function (repoId) {
  return http.get({
    host,
    path: `/api/v4/projects/${repoId}/repository/branches`,
    headers
  });
};

module.exports = {
  createBranch,
  getBranchesByTaskId,
  getBranchesByRepoId
};
