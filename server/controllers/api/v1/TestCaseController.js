const {
  TestCase,
  TestCaseSteps,
  TestSuite,
  User,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary
} = require('../../../models');
const createError = require('http-errors');

const includeOpition = [
  {
    model: TestCaseSteps,
    as: 'testCaseSteps'
  },
  {
    model: TestSuite,
    as: 'testSuiteInfo'
  },
  {
    model: User,
    as: 'authorInfo',
    attributes: [
      'fullNameRu',
      'fullNameEn'
    ]
  },
  {
    model: TestCaseStatusesDictionary,
    as: 'testCaseStatus'
  },
  {
    model: TestCaseSeverityDictionary,
    as: 'testCaseSeverity'
  }
];

const getTestCaseByParams = async params =>
  await TestCase.findOne({
    include: includeOpition,
    where: params
  });

exports.getAllTestCases = async (req, res, next) => {
  try {
    const { query } = req;
    const projectId = query.projectId ? query.projectId : null;
    const whereValue = {
      projectId
    };
    const testCases = await TestCase.findAll({
      include: includeOpition,
      where: whereValue
    });
    res.json(testCases);
  } catch (e) {
    next(e);
  }
};

exports.getTestCaseById = async (req, res, next) => {
  const { params } = req;
  try {
    const testCase = await getTestCaseByParams(params);
    res.json(testCase);
  } catch (e) {
    next(e);
  }
};

exports.createTestCase = async (req, res, next) => {
  try {
    const { body, user } = req;
    const testCaseSteps = body.testCaseSteps;
    if (!testCaseSteps) {
      return next(createError(500, 'Test case steps is empty!'));
    }
    const { dataValues: testCaseData } = await TestCase.create(body, {
      historyAuthorId: user.id
    });
    const testCaseId = testCaseData.id;
    const updatedSteps = testCaseSteps.map(item => ({
      ...item,
      testCaseId
    }));
    await TestCaseSteps.bulkCreate(updatedSteps);
    const result = await getTestCaseByParams({ id: testCaseId });
    res.send(result);
  } catch (e) {
    next(e);
  }
};

exports.updateTestCase = async (req, res, next) => {
  try {
    const { body, params: { id }, user } = req;
    const testCaseSteps = body.testCaseSteps;
    if (!testCaseSteps) {
      return next(createError(500, 'Test case steps is empty!'));
    }
    await TestCaseSteps.destroy({
      where: {
        testCaseId: id
      }
    });
    await TestCase.update(body, {
      where: {
        id
      },
      individualHooks: true,
      historyAuthorId: user.id
    });
    const updatedSteps = testCaseSteps.map(item => ({
      ...item,
      testCaseId: id
    }));
    await TestCaseSteps.bulkCreate(updatedSteps);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

exports.deleteTestCase = async (req, res, next) => {
  try {
    const { params: { id }, user } = req;
    await TestCase.destroy({
      where: {
        id
      },
      individualHooks: true,
      historyAuthorId: user.id
    });
    await TestCaseSteps.destroy({
      where: {
        testCaseId: id
      }
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
