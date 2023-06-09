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
    const { startDate, endDate, lang, userId } = req.query;
    const sprintId = req.query.sprintId ? req.query.sprintId : null;
    const label = req.query.label ? req.query.label : '';

    if (lang && !(/^(en|ru)$/).test(lang)) {
      return next(createError(400, 'Unsupported language: ' + lang));
    }

    const { workbook, options } = await ReportsService.byPeriod
      .getReport(req.params.projectId, startDate && endDate && {
        startDate, endDate, label, sprintId,
      }, { lang, userId });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(options.fileName) + '.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(createError(err));
  }
};

exports.companyByPeriod = async (req, res, next) => {
  try {
    const { startDate, endDate, lang } = req.query;
    const sprintId = req.query.sprintId ? req.query.sprintId : null;
    const label = req.query.label ? req.query.label : '';

    if (lang && !(/^(en|ru)$/).test(lang)) {
      return next(createError(400, 'Unsupported language: ' + lang));
    }

    const { workbook, options } = await ReportsService.byPeriod
      .getCompanyReport(startDate && endDate && {
        startDate, endDate, label, sprintId,
      }, { lang });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(options.fileName) + '.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(createError(err));
  }
};

exports.userByPeriod = async (req, res, next) => {
  try {
    const { startDate, endDate, lang, userId } = req.query;

    if (lang && !(/^(en|ru)$/).test(lang)) {
      return next(createError(400, 'Unsupported language: ' + lang));
    }
    const { workbook, options } = await ReportsService.byPeriod
      .getUserReport(startDate && endDate && {
        startDate, endDate,
      }, { lang, userId });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(options.fileName) + '.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(createError(err));
  }
};

exports.byTestPlan = async (req, res, next) => {
  if (!req.params.projectId.match(/^[0-9]+$/) || !req.params.testPlanId.match(/^[0-9]+$/)) {
    return next(createError(400, 'id must be int'));
  }
  if (!req.user.canReadProject(req.params.projectId)) {
    return next(createError(403, 'Access denied'));
  }
  const { testPlanId } = req.params;
  const { lang = 'en' } = req.query;
  try {
    const { workbook, options } = await ReportsService.byTestPlan(testPlanId, lang);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(options.fileName) + '.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(createError(err));
  }
};
