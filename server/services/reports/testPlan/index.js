const {
  TestRun,
  TestCase,
  TestRunTestCases,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary,
  TestSuite,
  User
} = require('../../../models');
const { getWorkBook } = require('../utils');
const locales = require('./i18n.json');

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
            as: 'testCaseStatus'
          },
          {
            model: TestCaseSeverityDictionary,
            as: 'testCaseSeverity'
          },
          {
            as: 'authorInfo',
            model: User,
            required: false,
            attributes: ['fullNameEn', 'fullNameRu' ]
          }
        ]
      }
    ]
  }
];

module.exports = async ({ params, lang = 'en' }) => {
  const testRun = await TestRun.findOne({
    include: includeOptions,
    where: { id: params.testPlanId }
  }).then(r => r.get({ plain: true }));

  const casesBySuites = testRun.testRunTestCases.reduce((acc, item) => {
    let { testSuiteId } = item.testCaseInfo;
    if (!testSuiteId) testSuiteId = 'withoutSuite';
    if (!Array.isArray(acc[testSuiteId])) acc[testSuiteId] = [];
    acc[testSuiteId].push(item.testCaseInfo);
    return acc;
  }, {});

  const suitesIds = Object.keys(casesBySuites).filter(item => item !== 'withoutSuite').map(Number);
  const includedSuites = await TestSuite.findAll({ where: { id: suitesIds } })
    .then(items => items.map(item => item.get({ plain: true })));

  const { withoutSuite } = casesBySuites;
  const l = locales[lang];

  const workbook = getWorkBook();
  const worksheet = workbook.addWorksheet(testRun.title);
  const titleFont = {name: 'Calibri', color: {argb: 'F44546A'}, bold: true, size: 14};
  let currentRow = 1;
  worksheet.columns = [
    { header: 'empty', key: 'empty', width: 3 },
    { header: 'id', key: 'id', width: 10 },
    { header: 'title', key: 'title', width: 46 },
    { header: 'description', key: 'description', width: 48 },
    { header: 'status', key: 'status', width: 10 },
    { header: 'severity', key: 'severity', width: lang === 'en' ? 10 : 20 },
    { header: 'duration', key: 'duration', width: lang === 'en' ? 10 : 15 },
    { header: 'priority', key: 'priority', width: 12 },
    { header: 'author', key: 'author', width: 26 }
  ];

  worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = `${l.TEST_PLAN}: ${testRun.title}`;
  worksheet.getCell(`A${currentRow}`).font = titleFont;
  currentRow += 2;

  if (testRun.description && testRun.description.trim().length > 0) {
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    worksheet.getRow(currentRow).height = testRun.description.trim().length > 350 ? 56 : 22;
    worksheet.getCell(`A${currentRow}`).border = {bottom: {style: 'medium', color: {argb: 'FA2b8E1'}}};
    worksheet.getCell(`A${currentRow}`).alignment = { vertical: 'top', wrapText: true};
    worksheet.getCell(`A${currentRow}`).value = `${testRun.description.trim()}`;
    currentRow += 2;
  }

  worksheet.getRow(currentRow)
    .values = [ '', l.COLUMN_ID, l.COLUMN_TITLE, l.COLUMN_DESCRIPTION, l.COLUMN_STATUS, l.COLUMN_SEVERITY, l.COLUMN_DURATION, l.COLUMN_PRIORITY, l.COLUMN_AUTHOR];
  worksheet.getRow(currentRow).font = {name: 'Calibri', bold: true};
  currentRow++;

  const fillCase = ({ id, title, description, testCaseStatus, testCaseSeverity, duration, priority, authorInfo }) => {
    const status = testCaseStatus ? (lang === 'en' ? testCaseStatus.nameEn : testCaseStatus.name) : '';
    const severity = testCaseSeverity ? (lang === 'en' ? testCaseSeverity.nameEn : testCaseSeverity.name) : '';
    const authorName = authorInfo ? (lang === 'en' ? authorInfo.fullNameEn : authorInfo.fullNameRu) : '';
    const row = worksheet.addRow(['', `#${id}`, title, description, status, severity, duration, priority, authorName]);
    row.getCell(3).alignment = { wrapText: true };
    row.getCell(4).alignment = { wrapText: true };
    currentRow++;
  };
  let testCasesSum = 0;
  includedSuites.forEach(suite => {
    worksheet.addRow([]);
    currentRow++;
    worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `#${suite.id} ${suite.title}`;

    const testCases = casesBySuites[suite.id] || [];
    testCasesSum += testCases.length;
    testCases.forEach(el => fillCase(el));
    worksheet.addRow([]);
    currentRow++;
  });

  if (withoutSuite) {
    worksheet.addRow([]);
    currentRow++;
    worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `#${l.WITHOUT_SUITE}`;
    testCasesSum += withoutSuite.length;
    withoutSuite.forEach(el => fillCase(el));
  }
  currentRow += 2;
  const boarderStyle = {style: 'medium', color: {argb: 'FA2b8E1'}};
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
  worksheet.getCell(`A${currentRow}`).border = {
    top: boarderStyle,
    bottom: boarderStyle
  };
  worksheet.getCell(`A${currentRow}`).value = `${l.TEST_CASES_SUM}: ${testCasesSum}`;
  return {
    workbook,
    options: {
      fileName: `${testRun.title}.${lang}`
    }
  };
};
