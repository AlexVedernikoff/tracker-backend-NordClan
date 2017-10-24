const models = require('../models');

module.export = function(projectId, request) {
  models
    .ProjectModelHistory
    .findAll(request)
    .then(histories => {
      return appendMessageField(histories)
    })
}

function appendMessageField(histories) {
}
