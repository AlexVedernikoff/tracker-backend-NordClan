const WorkSheetTemplate = require('./workSheetTemplate');
const i18n = require('./byUser.i18n.json');

const getFullName = (user) => user.fullName || user.firstName + ' ' + user.lastName;

class ByUserWorkSheet extends WorkSheetTemplate {
  constructor (workbook, data, lang) {
    super(workbook, data, lang);
    this._lastIndexRow = 0;
  }

  init () {
    super.init();

    this._data.byUser.forEach(sprint => {
      this._writeUserBySprint(sprint);
    });

    this._writeTottalSummary();
  }

  _writeUserBySprint (sprint) {
    const locale = i18n[this.lang];
    if (sprint.timeSheets.length > 0) {
      this._writeSectionName(`"${sprint.name}" ${locale.LASTS_SINCE} ${sprint.factStartDate} ${locale.LASTS_UPTO} ${sprint.factFinishDate}`);
      sprint.timeSheets.forEach(data => {
        this._writeTimesheetByUser(data);
      });
    }
  }

  _writeTimesheetByUser (timeSheets) {
    const locale = i18n[this.lang];
    this._writeSectionName(getFullName(timeSheets.user));
    if (timeSheets.tasks.length > 0) {
      timeSheets.tasks.forEach(task => {
        this._writeUserRow(task);
      });
      this._writeSummary(timeSheets.tasks);
    }
    if (timeSheets.otherTasks) {
      this._writeSectionName(locale.OTHER_TASKS);
      timeSheets.otherTasks.forEach(task => {
        this._writeUserRow(task);
      });
      this._writeSummary(timeSheets.otherTasks);
    }
    this._lastIndexRow++;
  }

  _writeSectionName (name) {
    this._lastIndexRow++;
    this._worksheet
      .mergeCells(`${this._columns[0] + this._lastIndexRow}:${this._columns[2] + this._lastIndexRow}`);
    this._worksheet
      .getCell(this._columns[0] + this._lastIndexRow)
      .value = name;
    this._lastIndexRow++;
  }

  _writeUserRow (task) {
    this._lastIndexRow++;
    this._tableColumns.forEach((v, i) => {
      const cell = this._worksheet.getCell(this._columns[i] + this._lastIndexRow);
      cell
        .value = v.calculate(task);
      cell
        .alignment = v.alignment || {};
    });
  }

  _writeSummary (tasks) {
    this._lastIndexRow++;
    const index = this._tableColumns.findIndex(v => v.isSummary);
    if (~index) {
      const cell = this._worksheet.getCell(this._columns[index] + this._lastIndexRow);
      cell
        .alignment = this._tableColumns[index].alignment || {};
      cell
        .value = tasks.reduce((count, task) => count + Number(task.spentTime), 0);
    }
  }

  _writeTottalSummary () {
    const locale = i18n[this.lang];
    this._lastIndexRow++;
    const index = this._tableColumns.findIndex(v => v.isSummary);
    if (~index) {
      this._worksheet.getCell(this._columns[index - 1] + this._lastIndexRow)
        .value = locale.TOTAL_AMOUNT;
      const cell = this._worksheet.getCell(this._columns[index] + this._lastIndexRow);
      cell
        .alignment = this._tableColumns[index].alignment || {};
      cell
        .value = Number(this._tottalSpent);
    }
  }

  get _tableColumns () {
    const locale = i18n[this.lang];
    return [
      {calculate: () => '', text: '', width: 3},
      {calculate: d => d.task.isMagic ? '' : `${this._prefix}-${d.task.id}`, text: '#'},
      {calculate: d => d.task.name, text: locale.TASK, width: 50, alignment: {wrapText: true}},
      {calculate: d => d.task.typeName, text: locale.TYPE, width: 13, alignment: {wrapText: true}},
      {calculate: d => d.comment, text: locale.DESCRIPTION, width: 40, alignment: {wrapText: true}},
      {calculate: d => d.onDate, text: locale.DATE, width: 13},
      {
        calculate: d => {
          const value = Number(d.spentTime);
          this._tottalSpent += value;
          return value;
        },
        text: locale.HOURS_SPENT,
        numFmt: '0.00',
        width: 13,
        alignment: {horizontal: 'right'},
      },
      {calculate: () => '', text: locale.HOURS_TOTAL, width: 13, isSummary: true, numFmt: '0.00', alignment: {horizontal: 'right'}},
    ];
  }

  get _name () {
    const locale = i18n[this.lang];
    return locale.SHEET_TITLE;
  }
}

module.exports = ByUserWorkSheet;
