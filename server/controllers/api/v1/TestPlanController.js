const {
  TestPlan,
  TestPlanTestCases,
  TestCase,
  TestCaseSteps,
  User,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary,
  ProjectEnvironmentTestPlan
} = require('../../../models');
const createError = require('http-errors');

const includeOptions = [
  {
    model: TestPlanTestCases,
    as: 'testPlanTestCases',
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
  }
];

const getTestPlanByParams = async params =>
  await TestPlan.findOne({
    include: includeOptions,
    where: params
  });

exports.getAllTestPlans = async (req, res, next) => {
  try {
    const result = await TestPlan.findAll({
      include: includeOptions
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.getTestPlanById = async (req, res, next) => {
  const { params } = req;
  try {
    const result = await getTestPlanByParams(params);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.createTestPlan = async (req, res, next) => {
  try {
    const { body, user } = req;
    const { testCasesData, projectEnvironments } = body;
    if (!testCasesData) {
      return next(createError(500, 'Test cases data is empty'));
    }
    if (!projectEnvironments) {
      return next(createError(500, 'Set at least one project environment for that test case'));
    }
    const { dataValues: testPlanResult } = await TestPlan.create(body, {
      historyAuthorId: user.id
    });

    const updatedPorjectEnvArr = projectEnvironments.map(item => ({
      projectEnvironmentId: item,
      testPlanId: testPlanResult.id
    }));
    await ProjectEnvironmentTestPlan.bulkCreate(updatedPorjectEnvArr);

    const updatedTestCaseData = testCasesData.map(item => ({
      ...item,
      testPlanId: testPlanResult.id
    }));
    await TestPlanTestCases.bulkCreate(updatedTestCaseData);

    const result = await getTestPlanByParams({ id: testPlanResult.id });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.updateTestPlan = async (req, res, next) => {
  try {
    const { body, params: { id }, user } = req;
    const testCasesData = body.testCasesData;
    if (!testCasesData) {
      return next(createError(500, 'Test cases data is empty'));
    }
    await TestPlanTestCases.destroy({
      where: {
        testPlanId: id
      }
    });
    await TestPlan.update(body, {
      where: {
        id
      },
      historyAuthorId: user.id,
      individualHooks: true
    });
    const updatedTestCaseData = testCasesData.map(item => ({
      ...item,
      testPlanId: id
    }));
    await TestPlanTestCases.bulkCreate(updatedTestCaseData);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

exports.deleteTestPlan = async (req, res, next) => {
  try {
    const { params, user } = req;
    await TestPlan.destroy({
      where: params,
      historyAuthorId: user.id,
      individualHooks: true
    });
    await TestPlanTestCases.destroy({
      where: {
        testPlanId: params.id
      }
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
