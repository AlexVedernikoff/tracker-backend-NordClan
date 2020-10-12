const {
  TestSuite,
  TestCase,
  TestCaseSteps,
  TestCaseAttachments,
  User,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary,
  TestRunTestCases,
  TestCaseExecution
} = require('../../../models');
const createError = require('http-errors');
const { copyTestCase, sanitizeTestCase } = require('../../../services/testCase');

const includeOption = [
  {
    model: TestCaseSteps,
    as: 'testCaseSteps'
  },
  {
    model: TestCaseAttachments,
    as: 'testCaseAttachments'
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
const stepsOrder = [[{ model: TestCaseSteps, as: 'testCaseSteps' }, 'id', 'ASC']];

const getTestCaseByParams = async params =>
  await TestCase.findOne({
    include: includeOption,
    where: params,
    order: [stepsOrder]
  });

const selectFormattedTestCases = async (criterion) => {
  const testCases = await TestCase.findAll({
    include: includeOption,
    order: [stepsOrder],
    ...criterion
  }).map((entry) => entry.toJSON());
  return testCases.reduce((accumulator, testCase) => {
    const isWithTestSuite = typeof testCase.testSuiteId === 'number';
    accumulator[isWithTestSuite ? 'withTestSuite' : 'withoutTestSuite'].push(testCase);
    return accumulator;
  }, { withoutTestSuite: [], withTestSuite: [] });
};

const validateCaseAndSuiteRelation = async (testCase) => {
  const sanitized = sanitizeTestCase(testCase);
  if (sanitized.testSuiteId) {
    const parentSuite = await TestSuite.findOne({ where: { id: sanitized.testSuiteId } }).then(s => s.get({ plain: true }));
    if (parentSuite) {
      const isInvalidRelation
        = (parentSuite.projectId === null && sanitized.projectId !== null)
        || (parentSuite.projectId !== null && sanitized.projectId === null)
        || (parentSuite.projectId !== null && sanitized.projectId !== null && parentSuite.projectId !== sanitized.projectId);

      if (isInvalidRelation) throw new Error('cant change relation');
    }
  }
};

exports.getTemplates = async (req, res, next) => {
  try {
    const criterion = {
      where: { projectId: { $eq: null } }
    };
    const { withoutTestSuite, withTestSuite } = await selectFormattedTestCases(criterion);
    res.json({
      withoutTestSuite,
      withTestSuite
    });
  } catch (e) {
    next(e);
  }
};

exports.getTestCases = async (req, res, next) => {
  try {
    const criterion = {
      where: { projectId: req.query.projectId || { $not: null } }
    };
    const { withoutTestSuite, withTestSuite } = await selectFormattedTestCases(criterion);
    res.json({
      withoutTestSuite,
      withTestSuite
    });
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
    await validateCaseAndSuiteRelation(body);
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
    await validateCaseAndSuiteRelation(body);
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
    await TestRunTestCases.destroy({
      where: {
        testCaseId: id
      }
    });
    await TestCaseExecution.destroy({
      where: {
        testCaseId: id
      }
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

exports.createProjectTestCase = async (req, res, next) => {
  try {
    const { user, body } = req;
    if (!body.projectId) throw new Error('available only with project id');

    const formattedBody = { ...body, testSuiteId: null };
    if (body.testSuiteId) {
      const templateCriterion = { id: body.testSuiteId };
      const suiteTemplate = await TestSuite.findOne({ where: templateCriterion });
      if (suiteTemplate) {
        const projectSuiteCriterion = { parentSuiteId: body.testSuiteId, projectId: body.projectId };
        const projectSuite = await TestSuite.findOne({ where: projectSuiteCriterion });
        if (projectSuite) {
          formattedBody.testSuiteId = projectSuite.id;
        }
      }
    }
    const testCaseId = await copyTestCase({ body: formattedBody, user });
    const result = await getTestCaseByParams({ id: testCaseId });
    res.send(result);
  } catch (e) {
    next(e);
  }
};
