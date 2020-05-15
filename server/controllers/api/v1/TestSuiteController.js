const {
  TestSuite,
  TestCase,
  TestCaseSteps,
  User,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary
} = require('../../../models');

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

exports.getAllTestSuites = async (req, res, next) => {
  try {
    const testSuite = await TestSuite.findAll({
      include: includeOptions
    });
    res.json(testSuite);
  } catch (e) {
    next(e);
  }
};

exports.getTestSuiteById = async (req, res, next) => {
  const { params } = req;
  try {
    const testCase = await TestSuite.findOne({
      include: includeOptions,
      where: params
    });
    res.json(testCase);
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
