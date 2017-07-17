exports.deleteUnderscoredTimeStampsAttributes = function(model) {
  if(Array.isArray(model)) {
    findAllDeleteUnderscoredTimeStampsAttributes(model);
  } else {
    findDeleteUnderscoredTimeStampsAttributes(model);
  }
};

function findAllDeleteUnderscoredTimeStampsAttributes(models) {
  models.forEach((p) => {
    findDeleteUnderscoredTimeStampsAttributes(p);
  });
}

function findDeleteUnderscoredTimeStampsAttributes(model) {
  if(model.dataValues) {
    if(model.dataValues.deleted_at || model.dataValues.deleted_at === null)
      delete model.dataValues.deleted_at;

    if(model.dataValues.created_at)
      delete model.dataValues.created_at;

    if(model.dataValues.updated_at)
      delete model.dataValues.updated_at;
  }
}
