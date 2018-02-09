const createError = require('http-errors');
const ReportsService = require('../../../services/reports');

exports.byPeriod = async (req, res, next) => {
  if (!req.params.projectId.match(/^[0-9]+$/)) {
    return next(createError(400, 'id must be int'));
  }

  if (req.query.sprintId && !req.query.sprintId.match(/^[0-9]+$/)) {
    return next(createError(400, 'sprint id must be int'));
  }

  if (!req.user.canReadProject(req.params.projectId)) {
    next(createError(403, 'Access denied'));
  }

  try {
    const {startDate, endDate} = req.query;
    const sprintId = req.query.sprintId ? req.query.sprintId : null;
    const {workbook, options} = await ReportsService.byPeriod
      .getReport(req.params.projectId, startDate && endDate && {
        startDate, endDate
      }, sprintId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(options.fileName) + '.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(createError(err));
  }
};
