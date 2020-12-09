const createError = require('http-errors');
const AgentService = require('../../../services/agent');

exports.list = async (req, res, next) => {
  try {
    AgentService.validate(req.body);

    const {projectId, startDate, endDate, recalculate} = req.body;

    if (recalculate) {
      await AgentService.calculateByProject(projectId, req.user.dataValues.fullNameRu);
    }

    const metrics = await AgentService.list({
      projectId,
      startDate,
      endDate,
    });

    res.json(metrics);

  } catch (error) {
    next(createError(error));
  }
};
