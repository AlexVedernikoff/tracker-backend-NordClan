const {
  TestRun,
  TestCase,
  TestRunTestCases,
  TestCaseStatusesDictionary,
  TestCaseSeverityDictionary,
  TestSuite
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
          }
        ]
      }
    ]
  }
];

module.exports = async ({ user, params, lang = 'en' }) => {
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
  let currentRow = 1;
  worksheet.columns = [
    { header: '', key: 'empty', width: 3 },
    { header: '', key: 'id', width: 10 },
    { header: '', key: 'title', width: 46 },
    { header: '', key: 'description', width: 48 },
    { header: '', key: 'status', width: 10 },
    { header: '', key: 'severity', width: lang === 'en' ? 10 : 20 },
    { header: '', key: 'duration', width: lang === 'en' ? 10 : 15 },
    { header: '', key: 'priority', width: 10 }
  ];

  worksheet.getRow(currentRow)
    .values = [ '', l.COLUMN_ID, l.COLUMN_TITLE, l.COLUMN_DESCRIPTION, l.COLUMN_STATUS, l.COLUMN_SEVERITY, l.COLUMN_DURATION, l.COLUMN_PRIORITY];
  currentRow++;

  const fillCase = ({ id, title, description, testCaseStatus, testCaseSeverity, duration, priority }) => {
    const status = testCaseStatus ? (lang === 'en' ? testCaseStatus.nameEn : testCaseStatus.name) : '';
    const severity = testCaseSeverity ? (lang === 'en' ? testCaseSeverity.nameEn : testCaseSeverity.name) : '';
    const row = worksheet.addRow(['', `#${id}`, title, description, status, severity, duration, priority]);
    row.getCell(3).alignment = { wrapText: true };
    row.getCell(4).alignment = { wrapText: true };
    currentRow++;
  };

  includedSuites.forEach(suite => {
    worksheet.addRow([]);
    currentRow++;
    worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `#${suite.id} ${suite.title}`;

    const testCases = casesBySuites[suite.id] || [];
    testCases.forEach(el => fillCase(el));
    worksheet.addRow([]);
    currentRow++;
  });

  if (withoutSuite) {
    worksheet.addRow([]);
    currentRow++;
    worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `#${l.WITHOUT_SUITE}`;

    withoutSuite.forEach(el => fillCase(el));
  }

  return {
    workbook,
    options: {
      fileName: `${testRun.title}.${lang}`
    }
  };
};
