const { TestCase, TestCaseSteps, TestSuite, User } = require('../../../models');
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
  }
];

const getTestCaseByParams = async params =>
  await TestCase.findOne({
    include: includeOpition,
    where: params
  });

exports.getAllTestCases = async (req, res, next) => {
  try {
    const testCases = await TestCase.findAll({
      include: includeOpition
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
    const { body } = req;
    const testCaseSteps = body.testCaseSteps;
    if (!testCaseSteps) {
      return next(createError(500, 'Test case steps is empty!'));
    }
    const { dataValues: testCaseData } = await TestCase.create(body);
    const testCaseId = testCaseData.id;
    const updatedSteps = testCaseSteps.map(item => ({
      ...item,
      testCaseId
    }));
    await TestCaseSteps.bulkCreate(updatedSteps);
    //Новый запрос а бд, т.к. почему-то не возвращаются id созданных TestCaseSteps
    const result = await getTestCaseByParams({ id: testCaseId });
    res.send(result);
  } catch (e) {
    next(e);
  }
};

exports.updateTestCase = async (req, res, next) => {
  try {
    const { body, params: { id } } = req;
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
      }
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
    const id = req.params.id;
    await TestCase.destroy({
      where: {
        id
      }
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
