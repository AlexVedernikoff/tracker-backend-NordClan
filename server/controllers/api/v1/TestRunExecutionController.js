const {
  TestRunExecution,
  TestRun,
  ProjectEnvironment,
  User,
  TestCaseExecution,
  TestCaseSteps,
  TestStepExecution,
  TestCase,
  TestCaseStepExecutionStatusDictionary,
  TestSuite,
  TestCaseExecutionAttachments,
  TestStepExecutionAttachments
} = require('../../../models');
const createError = require('http-errors');

const LIMIT = 10;

const includeOptions = [
  {
    model: TestRun,
    as: 'testRunInfo'
  },
  {
    model: ProjectEnvironment,
    as: 'projectEnvironmentInfo'
  },
  {
    model: User,
    as: 'startedByUser',
    attributes: ['fullNameRu', 'fullNameEn']
  },
  {
    model: TestCaseExecution,
    as: 'testCaseExecutionData',
    include: [
      {
        model: TestCase,
        as: 'testCaseInfo',
        include: [
          {
            model: TestSuite,
            as: 'testSuiteInfo'
          }
        ]
      },
      {
        model: TestStepExecution,
        as: 'testStepExecutionData',
        separate: true,
        include: [
          {
            model: TestCaseSteps,
            as: 'testStepInfo'
          },
          {
            model: TestCaseStepExecutionStatusDictionary,
            as: 'testStepStatus'
          },
          {
            model: TestStepExecutionAttachments,
            as: 'attachments'
          }
        ]
      },
      {
        model: TestCaseStepExecutionStatusDictionary,
        as: 'testCaseStatus'
      },
      {
        model: TestCaseExecutionAttachments,
        as: 'attachments'
      }
    ]
  }
];

const getTestRunExecutionByPrimary = async (id, params) =>
  await TestRunExecution.findByPrimary(id, {
    where: params,
    include: includeOptions
  });

exports.getCountedAll = async (req, res, next) => {
  try {
    const { params, query } = req;
    const { page = 1, ...restQueryData } = query;
    const where = {
      ...params,
      ...restQueryData
    };
    const offset = (Number(page) - 1) * LIMIT;
    const data = await TestRunExecution.findAndCountAll({
      where,
      include: [
        {
          model: TestRun,
          as: 'testRunInfo'
        },
        {
          model: ProjectEnvironment,
          as: 'projectEnvironmentInfo'
        },
        {
          model: User,
          as: 'startedByUser',
          attributes: ['fullNameRu', 'fullNameEn']
        },
        {
          model: TestCaseExecution,
          as: 'testCaseExecutionData'
        }
      ],
      offset,
      limit: LIMIT,
      distinct: true
    });
    res.json(data);
  } catch (e) {
    next(createError(e));
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { params: { id } } = req;
    const result = await getTestRunExecutionByPrimary(id);
    res.json(result);
  } catch (e) {
    next(createError(e));
  }
};

const addTestCaseToTestRunExecution = async (testRunExecutionId, testCasesIds) => {
  const testCaseExecutionToInsert = testCasesIds.map(testCaseId => ({ testRunExecutionId, testCaseId }));
  const testCaseExecutionData = await TestCaseExecution.bulkCreate(testCaseExecutionToInsert, { returning: true });
  const testCasesSteps = await TestCaseSteps.findAll({ where: { testCaseId: testCasesIds } });
  const testStepExecutionToInsert = testCasesSteps.map(item => {
    const itemTestCaseExecution = testCaseExecutionData.find(
      testCaseExecutionItem => testCaseExecutionItem.dataValues.test_case_id === item.testCaseId
    );
    return {
      testCaseExecutionId: itemTestCaseExecution.id,
      testStepId: item.id
    };
  });
  await TestStepExecution.bulkCreate(testStepExecutionToInsert);
};

const deleteTestCaseFromTestRunExecution = async (testRunExecutionId, testCasesIds) => {
};


exports.create = async (req, res, next) => {
  try {
    const { body } = req;
    const { testCasesIds, ...testRunExecution } = body;
    const { dataValues: testRunExecutionCreateResult } = await TestRunExecution.create({
      ...testRunExecution,
      startTime: new Date()
    });
    await addTestCaseToTestRunExecution(testRunExecutionCreateResult.id, testCasesIds);
    const result = await getTestRunExecutionByPrimary(testRunExecutionCreateResult.id);
    res.json(result);
  } catch (e) {
    next(createError(e));
  }
};

exports.updateTestRunExecution = async (req, res, next) => {
  try {
    const { params: { id }, body } = req;
    const { testCasesIds, ...testRunExecution } = body;
    const status = body.status;
    if (status === 4) {
      testRunExecution.finishTime = new Date();
    }
    await TestRunExecution.update(testRunExecution, {
      where: {
        id
      }
    });

    const oldTestCaseExecution = await TestCaseExecution.findAll({
      where: {
        testRunExecutionId: id
      }
    });
    const oldTestCasesIds = oldTestCaseExecution.map(ce => ce.testCaseId);
    const addTestCasesIds = testCasesIds.filter(caseId => !oldTestCasesIds.includes(caseId));
    const removeTestCases = oldTestCasesIds.filter(caseId => !testCasesIds.includes(caseId));

    await addTestCaseToTestRunExecution(id, addTestCasesIds);
    await TestCaseExecution.destroy({
      where: { testRunExecutionId: id, testCaseId: removeTestCases }
    });

    res.sendStatus(204);
  } catch (e) {
    next(createError(e));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { params: { id } } = req;
    await TestRunExecution.destroy({
      where: {
        id
      }
    });
    res.sendStatus(200);
  } catch (e) {
    next(createError(e));
  }
};

exports.updateTestStepExecution = async (req, res, next) => {
  try {
    const { params: { id }, body } = req;
    await TestStepExecution.update(body, {
      where: {
        id
      }
    });
    res.sendStatus(204);
  } catch (e) {
    next(createError(e));
  }
};

exports.updateTestCaseExecution = async (req, res, next) => {
  try {
    const { params: { id }, body } = req;
    await TestCaseExecution.update(body, {
      where: {
        id
      }
    });
    res.sendStatus(204);
  } catch (e) {
    next(createError(e));
  }
};
