const { list } = require('./list');
const { create } = require('./create');
const { createDraft } = require('./createDraft');
const { getDraft } = require('./createDraft');
const { destroy } = require('./destroy');
const { getTracksAll } = require('./getTracksAll');
const { getTaskSpent } = require('./spent');
const { update } = require('./update');
const { updateDraft } = require('./updateDraft');
const { isNeedCreateDraft } = require('./utils');

module.exports = {
  create,
  createDraft,
  destroy,
  getTaskSpent,
  getTracksAll,
  list,
  update,
  updateDraft,
  isNeedCreateDraft,
  getDraft
};
