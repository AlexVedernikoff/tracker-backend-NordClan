const { TestCase, TestCaseSteps } = require('../../models');
const { sanitizeTestCase } = require('./sanitizeTestCase');

const copyTestCase = async ({ body, user }) => {
  const { dataValues: testCaseData } = await TestCase.create(sanitizeTestCase({ ...body, authorId: user.id }), {
    historyAuthorId: user.id
  });
  const testCaseId = testCaseData.id;
  const steps = Array.isArray(body.testCaseSteps) ? body.testCaseSteps : [];
  if (steps.length) {
    const stepsToCopy = steps.map(({ id, ...item }) => ({ ...item, testCaseId }));
    await TestCaseSteps.bulkCreate(stepsToCopy);
  }
  return testCaseId;
};

module.exports = { copyTestCase };
