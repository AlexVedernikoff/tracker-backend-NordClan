const { list } = require('./list');
const { listProject } = require('./listProject');
const { create } = require('./create');
const { createDraft } = require('./createDraft');
const { getDraft } = require('./createDraft');
const { destroy } = require('./destroy');
const { getTracksAll } = require('./getTracksAll');
const { getTaskSpent } = require('./spent');
const { update } = require('./update');
const { updateDraft } = require('./updateDraft');
const { isNeedCreateDraft } = require('./utils');
const { submit, approve, reject } = require('./changeStatus');
const { listTask } = require('./listTask');

module.exports = {
  create,
  createDraft,
  destroy,
  getTaskSpent,
  getTracksAll,
  list,
  listProject,
  listTask,
  update,
  updateDraft,
  isNeedCreateDraft,
  getDraft,
  submit,
  approve,
  reject,
};
