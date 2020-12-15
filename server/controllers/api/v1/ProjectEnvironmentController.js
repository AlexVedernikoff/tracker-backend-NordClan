const {
  ProjectEnvironment,
} = require('../../../models');

exports.get = async (req, res, next) => {
  try {
    const { params: { projectId } } = req;
    const data = await ProjectEnvironment.findAll({
      where: {
        projectId,
      },
    });
    res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { body, params: { projectId } } = req;
    const createData = await ProjectEnvironment.create({
      ...body,
      projectId,
    });
    res.json(createData);
  } catch (e) {
    next(e);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { params: { environmentId} } = req;
    const environmentToDestroy = await ProjectEnvironment.findByPrimary(environmentId);
    await environmentToDestroy.destroy();
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
