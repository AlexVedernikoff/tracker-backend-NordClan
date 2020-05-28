const {
  TestRunExecution,
  TestRun,
  ProjectEnvironment,
  User,
  TestCaseExecution,
  TestRunTestCases,
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

exports.create = async (req, res, next) => {
  try {
    const { body } = req;
    const { testRunTestCases } = await TestRun.findByPrimary(body.testRunId, {
      include: [
        {
          model: TestRunTestCases,
          as: 'testRunTestCases'
        }
      ]
    });
    const testCasesIds = testRunTestCases.map(item => item.testCaseId);
    const { dataValues: testRunExecutionCreateResult } = await TestRunExecution.create({
      ...body,
      startTime: new Date()
    });
    const testCaseExecutionToInsert = testCasesIds.map(item => ({
      testRunExecutionId: testRunExecutionCreateResult.id,
      testCaseId: item
    }));
    const testCaseExecutionData = await TestCaseExecution.bulkCreate(testCaseExecutionToInsert, { returning: true });
    const testCasesSteps = await TestCaseSteps.findAll({
      where: {
        testCaseId: testCasesIds
      }
    });
    const testStepExecutionToInsert = testCasesSteps.map(item => {
      const itemTestCaseExecution = testCaseExecutionData.find(testCaseExecutionItem =>
        testCaseExecutionItem.dataValues.test_case_id === item.testCaseId);
      return {
        testCaseExecutionId: itemTestCaseExecution.id,
        testStepId: item.id
      };
    });
    await TestStepExecution.bulkCreate(testStepExecutionToInsert);
    const result = await getTestRunExecutionByPrimary(testRunExecutionCreateResult.id);
    res.json(result);
  } catch (e) {
    next(createError(e));
  }
};

exports.updateTestRunExecution = async (req, res, next) => {
  try {
    const { params: { id }, body } = req;
    const dataToUpate = body;
    const status = body.status;
    if (status === 4) {
      dataToUpate.finishTime = new Date();
    }
    await TestRunExecution.update(dataToUpate, {
      where: {
        id
      }
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
