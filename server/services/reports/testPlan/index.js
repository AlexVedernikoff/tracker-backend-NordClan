const {
  TestRun,
  TestCase,
  TestRunTestCases,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary,
  TestSuite,
  User,
} = require('../../../models');
const { getWorkBook } = require('../utils');
const localize = require('./i18n.json');

const includeOptions = [
  {
    model: TestRunTestCases,
    separate: true,
    as: 'testRunTestCases',
    include: [
      {
        model: TestCase,
        as: 'testCaseInfo',
        include: [
          {
            model: TestCaseStatusesDictionary,
            as: 'testCaseStatus',
          },
          {
            model: TestCaseSeverityDictionary,
            as: 'testCaseSeverity',
          },
          {
            model: User,
            as: 'authorInfo',
            attributes: ['fullNameEn', 'fullNameRu' ],
          },
          {
            model: TestSuite,
            as: 'testSuiteInfo',
            attributes: ['title'],
          },
        ],
      },
    ],
  },
];

const getTestRunData = async (id) => {

  const testRun = await TestRun.findOne({
    include: includeOptions,
    where: { id },
  }).then(entity => entity.get({ plain: true }));

  const testPlanTitle = testRun.title;
  const testPlanDescription = testRun.description;

  const casesBySuites = testRun.testRunTestCases ? (testRun.testRunTestCases.reduce((acc, item) => {
    let { testSuiteId } = item.testCaseInfo || '';
    if (!testSuiteId) testSuiteId = 'withoutSuite';
    if (!Array.isArray(acc[testSuiteId])) acc[testSuiteId] = [];
    acc[testSuiteId].push(item.testCaseInfo);
    return acc;
  }, {})) : {};

  return {
    testPlanTitle,
    testPlanDescription,
    casesBySuites,
  };
};

module.exports = async (testPlanId, lang) => {
  const locale = localize[lang];

  const translate = (obj, en, ru, defaultVal = '') => {
    if (lang === 'en') return obj && obj[en] || defaultVal;
    if (lang === 'ru') return obj && obj[ru] || defaultVal;
    return defaultVal;
  };

  const testPlan = await getTestRunData(testPlanId);

  const { testPlanTitle, testPlanDescription, casesBySuites} = testPlan;
  const workbook = getWorkBook();
  const worksheet = workbook.addWorksheet(testPlanTitle);

  let currentRow = 1;
  let testCasesSum = 0;

  worksheet.columns = [
    { header: 'empty', key: 'empty', width: 3 },
    { header: 'id', key: 'id', width: 10 },
    { header: 'title', key: 'title', width: 46 },
    { header: 'description', key: 'description', width: 48 },
    { header: 'status', key: 'status', width: 10 },
    { header: 'severity', key: 'severity', width: 20 },
    { header: 'duration', key: 'duration', width: 15 },
    { header: 'priority', key: 'priority', width: 12 },
    { header: 'author', key: 'author', width: 26 },
  ];

  worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = `${locale.TEST_PLAN}: ${testPlanTitle}`;
  worksheet.getCell(`A${currentRow}`).font = {name: 'Calibri', color: {argb: 'F44546A'}, bold: true, size: 14};
  currentRow += 2;

  if (testPlanDescription && testPlanDescription.trim().length > 0) {
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    worksheet.getRow(currentRow).height = testPlanDescription.trim().length > 350 ? 56 : 22;
    worksheet.getCell(`A${currentRow}`).border = {bottom: {style: 'medium', color: {argb: 'FA2b8E1'}}};
    worksheet.getCell(`A${currentRow}`).alignment = { vertical: 'top', wrapText: true};
    worksheet.getCell(`A${currentRow}`).value = `${testPlanDescription.trim()}`;
    currentRow += 2;
  }

  worksheet.getRow(currentRow)
    .values = [
      '',
      locale.COLUMN_ID,
      locale.COLUMN_TITLE,
      locale.COLUMN_DESCRIPTION,
      locale.COLUMN_STATUS,
      locale.COLUMN_SEVERITY,
      locale.COLUMN_DURATION,
      locale.COLUMN_PRIORITY,
      locale.COLUMN_AUTHOR,
    ];
  worksheet.getRow(currentRow).font = {name: 'Calibri', bold: true};
  currentRow++;

  Object.keys(casesBySuites).forEach(suite => {
    const cases = casesBySuites[suite].filter(item => item);
    worksheet.addRow([]);
    currentRow++;
    worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
    if (cases.length > 0){

      worksheet.getCell(`A${currentRow}`).value = (cases[0]
      && cases[0].testSuiteInfo) ? (
          `#${suite} ${cases[0].testSuiteInfo.title}`) : `#${suite}`;

      cases.forEach(element => {
        const { id, title, description, testCaseStatus, testCaseSeverity, duration, priority, authorInfo } = element;

        const status = translate(testCaseStatus, 'nameEn', 'name');
        const severity = translate(testCaseSeverity, 'nameEn', 'name');
        const authorName = translate(authorInfo, 'fullNameEn', 'fullNameRu');
        const row = worksheet.addRow([
          '',
          `#${id}`,
          title,
          description,
          status,
          severity,
          duration,
          locale.PRORITY[priority],
          authorName]);
        row.getCell(3).alignment = { wrapText: true };
        row.getCell(4).alignment = { wrapText: true };
        currentRow++;
      });
      currentRow++;
      testCasesSum += cases.length;
    }
  });

  currentRow += 2;
  const boarderStyle = {style: 'medium', color: {argb: 'FA2b8E1'}};
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
  worksheet.getCell(`A${currentRow}`).border = {
    top: boarderStyle,
    bottom: boarderStyle,
  };
  worksheet.getCell(`A${currentRow}`).value = `${locale.TEST_CASES_SUM}: ${testCasesSum}`;
  return {
    workbook,
    options: {
      fileName: `${testPlanTitle}.${lang}`,
    },
  };
};
