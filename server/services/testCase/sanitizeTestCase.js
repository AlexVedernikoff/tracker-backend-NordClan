const sanitizeTestCase = (body) => {
  const {
    description, duration, postConditions, preConditions, priority, severityId, statusId,
    testCaseSeverity, testCaseStatus, title, projectId, testSuiteId, authorId
  } = body;
  const formattedProjectId = projectId === null ? null : parseInt(projectId, 10);
  const formattedtestSuiteId = testSuiteId === null ? null : parseInt(testSuiteId, 10);
  return {
    description, duration, postConditions, preConditions, priority, severityId, statusId,
    testCaseSeverity, testCaseStatus, title, projectId: formattedProjectId, testSuiteId: formattedtestSuiteId, authorId
  };
};

module.exports = { sanitizeTestCase };
