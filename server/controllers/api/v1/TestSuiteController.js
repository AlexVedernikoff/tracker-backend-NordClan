const {
  TestSuite,
  TestCase,
  TestCaseSteps,
  User,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary
} = require('../../../models');
const { copyTestCase } = require('../../../services/testCase');

const includeOptions = [
  {
    model: TestCase,
    as: 'testCases',
    include: [
      {
        model: TestCaseSteps,
        as: 'testCaseSteps'
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
    ]
  }
];

const getTestSuiteByParams = (params) => {
  return TestSuite.findOne({ include: includeOptions, where: params });
};

exports.getTemplates = async (req, res, next) => {
  try {
    const criterion = { ...req.query, projectId: { $eq: null } };
    const testSuite = await TestSuite.findAll({ include: includeOptions, where: criterion });
    res.json(testSuite);
  } catch (e) {
    next(e);
  }
};

exports.getTestSuites = async (req, res, next) => {
  try {
    const criterion = { ...req.query, projectId: req.query.projectId || { $not: null } };
    const testSuite = await TestSuite.findAll({ include: includeOptions, where: criterion });
    res.json(testSuite);
  } catch (e) {
    next(e);
  }
};

exports.getTestSuiteById = async (req, res, next) => {
  const { params } = req;
  try {
    const testSuite = await getTestSuiteByParams(params);
    res.json(testSuite);
  } catch (e) {
    next(e);
  }
};

exports.createTestSuite = async (req, res, next) => {
  try {
    const { body, user } = req;
    const result = await TestSuite.create(body, {
      historyAuthorId: user.id
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.updateTestSuite = async (req, res, next) => {
  try {
    const { body, params, user } = req;
    await TestSuite.update(body, {
      where: params,
      historyAuthorId: user.id,
      individualHooks: true
    });
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

exports.deleteTestSuite = async (req, res, next) => {
  try {
    const { params, user } = req;
    await TestSuite.destroy({
      where: params,
      historyAuthorId: user.id,
      individualHooks: true
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

const sanitizeTestSuite = (testSuite) => {
  const { title, description, projectId } = testSuite;
  return { title, description, projectId };
};

exports.createProjectTestSuite = async (req, res, next) => {
  try {
    const { body, user } = req;
    if (!body.projectId) throw new Error('available only with project id');

    const createdSuite = await TestSuite.create(sanitizeTestSuite(body), {
      historyAuthorId: user.id
    }).then(s => s.get({ plain: true }));
    const originalSuite = await getTestSuiteByParams({ id: body.id }).then(s => s.get({ plain: true }));
    if (originalSuite && Array.isArray(originalSuite.testCases)) {
      for (const testCase of originalSuite.testCases) {
        const formattedTestCase = { ...testCase, projectId: body.projectId, testSuiteId: createdSuite.id };
        await copyTestCase({ body: formattedTestCase, user });
      }
    }
    const result = await getTestSuiteByParams({ id: createdSuite.id });
    res.json(result);
  } catch (e) {
    next(e);
  }
};
