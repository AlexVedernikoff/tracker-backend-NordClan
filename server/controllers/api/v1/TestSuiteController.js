const { TestSuite, TestCase, TestCaseSteps, User } = require('../../../models');

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
    const { body } = req;
    const result = await TestSuite.create(body);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.updateTestSuite = async (req, res, next) => {
  try {
    const { body, params } = req;
    await TestSuite.update(body, {
      where: params
    });
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

exports.deleteTestSuite = async (req, res, next) => {
  try {
    const { params } = req;
    await TestSuite.destroy({
      where: params
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
