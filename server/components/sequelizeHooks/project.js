exports.setCompletedAtIfNeed = function (model) {
  if (+model._previousDataValues.statusId !== 3 && +model.statusId === 3) {
    model.completedAt = new Date();
  }

  if (+model._previousDataValues.statusId === 3 && +model.statusId !== 3) {
    model.completedAt = null;
  }
};
