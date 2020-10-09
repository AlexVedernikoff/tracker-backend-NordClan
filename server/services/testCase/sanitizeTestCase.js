const sanitizeTestCase = (body) => {
  const {
    description, duration, postConditions, preConditions, priority, severityId, statusId,
    testCaseSeverity, testCaseStatus, title, projectId, testSuiteId, authorId
  } = body;
  return {
    description, duration, postConditions, preConditions, priority, severityId, statusId,
    testCaseSeverity, testCaseStatus, title, projectId: projectId === null ? null : parseInt(projectId, 10), testSuiteId: parseInt(testSuiteId, 10), authorId
  };
};

module.exports = { sanitizeTestCase };
