const sanitizeTestSuite = (testSuite) => {
  const { title, description, projectId, id } = testSuite;
  return { title, description, projectId, parentSuiteId: id };
};

module.exports = { sanitizeTestSuite };
