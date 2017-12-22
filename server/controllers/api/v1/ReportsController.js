const createError = require('http-errors');
const ReportsService = require('../../../services/reports');

exports.byPeriod = async (req, res, next) => {
    if (!req.params.projectId.match(/^[0-9]+$/)) {
        return next(createError(400, 'id must be int'));
    }

    if (!req.user.canReadProject(req.params.projectId)) {
        next(createError(403, 'Access denied'));
    }

    try {
        const report = await ReportsService.byPeriod.getReport(req.body, req.params.projectId);
        res.json(report);
    } catch(err) {
        next(createError(err));
    }
};