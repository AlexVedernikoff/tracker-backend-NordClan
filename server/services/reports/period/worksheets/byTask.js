const WorkSheetTemplate = require('./workSheetTemplate');
const _ = require('lodash');
const i18n = require('./byTask.i18n.json');

const getFullName = (user) => user.fullName || user.firstName + ' ' + user.lastName;

class ByTaskWorkSheet extends WorkSheetTemplate {
  constructor (workbook, data, lang) {
    super(workbook, data, lang);
  }

  init () {
    super.init();

    this._data.byTasks.forEach(data => {
      this._write(data);
    });

    this._writeTottalSummary();
  }

  _write (data) {
    this._lastIndexRow++;
    this._writeTask(data.task);
    this._writeUsersRows(data.users);
    this._lastIndexRow++;
  }

  _writeTask (task) {
    this._worksheet
      .mergeCells(`${this._columns[0] + this._lastIndexRow}:${this._columns[2] + this._lastIndexRow}`);
    this._worksheet
      .getCell(this._columns[0] + this._lastIndexRow)
      .value = task.isMagic ? `${task.name}` : `${this._prefix}-${task.id} - ${task.name}`;
    if (task.isMagic) {
      return;
    }
    const planIndex = this._tableColumns.findIndex(row => row.ref === 'hoursPlan');
    if (~planIndex) {
      this._worksheet
        .getCell(this._columns[planIndex] + this._lastIndexRow)
        .value = Number(task.plannedExecutionTime);
    }
  }

  _writeUsersRows (users) {
    let totalTaskTime = 0;
    _(users)
      .groupBy('userId')
      .values()
      .value()
      .map(timeSheets =>
        _.transform(timeSheets, (result, ts) => {
          result.userRolesNames = ts.user.userRolesNames;
          result.typeName = ts.task.typeName;
          result.fullName = getFullName(ts.user);
          if (ts.comment) {
            result.comment += '- ' + ts.comment + '\r\n';
          }
          result.spentTime += Number(ts.spentTime);
        }, {userRolesNames: '', comment: '', spentTime: 0, fullName: ''})
      )
      .map(user => {
        this._lastIndexRow++;
        totalTaskTime += user.spentTime;
        this._tableColumns.forEach((v, i) => {
          const cell = this._worksheet.getCell(this._columns[i] + this._lastIndexRow);
          cell
            .value = v.calculate(user);
          cell
            .alignment = v.alignment || {};
        });

      });
    this._writeSummary(totalTaskTime);
  }

  _writeSummary (tottalTaskTime) {
    this._lastIndexRow++;
    const index = this._tableColumns.findIndex(v => v.isSummary);
    if (~index) {
      const cell = this._worksheet.getCell(this._columns[index] + this._lastIndexRow);
      cell
        .alignment = this._tableColumns[index].alignment || {};
      cell
        .value = tottalTaskTime;
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
      {calculate: d => d.fullName, text: locale.PERFORMER, width: 25},
      {calculate: d => d.userRolesNames, text: locale.ROLE, width: 13},
      {calculate: d => d.typeName, text: locale.TYPE, width: 13, alignment: {wrapText: true}},
      {calculate: d => d.comment, text: locale.DESCRIPTION, width: 40, alignment: {wrapText: true}},
      {calculate: () => '', text: locale.HOURS_PLANNED, width: 13, numFmt: '0.00', alignment: {wrapText: true}, ref: 'hoursPlan'},
      {
        calculate: d => {
          const value = Number(d.spentTime);
          this._tottalSpent += value;
          return value;
        },
        numFmt: '0.00',
        text: locale.HOURS_SPENT,
        width: 13,
        alignment: {horizontal: 'right'}
      },
      {calculate: () => '', text: locale.HOURS_TOTAL, width: 13, isSummary: true, numFmt: '0.00', alignment: {horizontal: 'right'}}
    ];
  }

  get _name () {
    const locale = i18n[this.lang];
    return locale.SHEET_TITLE;
  }
}

module.exports = ByTaskWorkSheet;
