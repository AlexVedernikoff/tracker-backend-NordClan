const { list } = require('./list');
const { create } = require('./create');
const { createDraft } = require('./createDraft');
const { destroy } = require('./destroy');
const { getTracksAll } = require('./getTracksAll');
const { update } = require('./update');
const { updateDraft } = require('./updateDraft');
const { isNeedCreateDraft } = require('./utils');

module.exports = {
  create,
  createDraft,
  destroy,
  getTracksAll,
  list,
  update,
  updateDraft,
  isNeedCreateDraft
};
