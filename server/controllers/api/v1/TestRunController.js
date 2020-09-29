const {
  TestRun,
  TestRunTestCases,
  TestCase,
  TestCaseSteps,
  User,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary,
  ProjectEnvironmentTestRun,
  ProjectEnvironment
} = require('../../../models');
const createError = require('http-errors');

const LIMIT = 10;

const includeOptions = [
  {
    model: TestRunTestCases,
    as: 'testRunTestCases',
    include: [
      {
        model: TestCase,
        as: 'testCaseInfo',
        include: [
          {
            model: User,
            as: 'authorInfo',
            attributes: ['fullNameEn', 'fullNameRu']
          },
          {
            model: TestCaseSteps,
            as: 'testCaseSteps'
          },
          {
            model: TestCaseStatusesDictionary,
            as: 'testCaseStatus'
          },
          {
            model: TestCaseSeverityDictionary,
            as: 'testCaseSeverity'
          }
        ]
      },
      {
        model: User,
        as: 'assignedUser',
        attributes: ['fullNameEn', 'fullNameRu']
      }
    ]
  },
  {
    model: ProjectEnvironment,
    as: 'testRunEnvironments'
  }
];

const getTestRunByParams = async params =>
  await TestRun.findOne({
    include: includeOptions,
    where: params
  });

exports.getAllTestRuns = async (req, res, next) => {
  try {
    const { params, query } = req;
    const { page = 1, ...restQueryData } = query;
    const whereOptions = {
      ...params,
      ...restQueryData
    };
    const offset = (Number(page) - 1) * LIMIT;
    const result = await TestRun.findAndCountAll({
      include: includeOptions,
      where: whereOptions,
      offset,
      limit: LIMIT
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.getTestRunById = async (req, res, next) => {
  const { params } = req;
  try {
    const result = await getTestRunByParams(params);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.createTestRun = async (req, res, next) => {
  try {
    const { body, user } = req;
    const { testCasesData, projectEnvironments } = body;

    if (!req.user.canReadProject(body.projectId)) {
      return next(createError(403, 'Access denied'));
    }
    if (!testCasesData) {
      return next(createError(500, 'Test cases data is empty'));
    }
    if (!projectEnvironments.length) {
      return next(createError(500, 'Set at least one project environment for that test case'));
    }
    const { dataValues: testRunResult } = await TestRun.create(body, {
      historyAuthorId: user.id
    });

    const updatedPorjectEnvArr = projectEnvironments.map(item => ({
      projectEnvironmentId: item,
      testRunId: testRunResult.id
    }));
    await ProjectEnvironmentTestRun.bulkCreate(updatedPorjectEnvArr);

    const updatedTestCaseData = testCasesData.map(item => ({
      ...item,
      testRunId: testRunResult.id
    }));
    await TestRunTestCases.bulkCreate(updatedTestCaseData);

    const result = await getTestRunByParams({ id: testRunResult.id });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.updateTestRun = async (req, res, next) => {
  try {
    const { body, params: { id }, user } = req;
    const testCasesData = body.testCasesData;
    if (!testCasesData) {
      return next(createError(500, 'Test cases data is empty'));
    }
    await TestRunTestCases.destroy({
      where: {
        testRunId: id
      }
    });
    await TestRun.update(body, {
      where: {
        id
      },
      historyAuthorId: user.id,
      individualHooks: true
    });
    const updatedTestCaseData = testCasesData.map(item => ({
      ...item,
      testRunId: id
    }));
    await TestRunTestCases.bulkCreate(updatedTestCaseData);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

exports.deleteTestRun = async (req, res, next) => {
  try {
    const { params, user } = req;
    await TestRun.destroy({
      where: params,
      historyAuthorId: user.id,
      individualHooks: true
    });
    await TestRunTestCases.destroy({
      where: {
        testRunId: params.id
      }
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
