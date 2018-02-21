const WorkSheetTemplate = require('./workSheetTemplate');
const _ = require('lodash');

class ByTaskWorkSheet extends WorkSheetTemplate {
  constructor (workbook, data) {
    super(workbook, data);
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
          result.fullNameRu = ts.user.fullNameRu;
          if (ts.comment) {
            result.comment += '- ' + ts.comment + '\r\n';
          }
          result.spentTime += Number(ts.spentTime);
        }, {userRolesNames: '', comment: '', spentTime: 0, fullNameRu: ''})
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
    this._lastIndexRow++;
    const index = this._tableColumns.findIndex(v => v.isSummary);
    if (~index) {
      this._worksheet.getCell(this._columns[index - 1] + this._lastIndexRow)
        .value = 'Общая сумма:';
      const cell = this._worksheet.getCell(this._columns[index] + this._lastIndexRow);
      cell
        .alignment = this._tableColumns[index].alignment || {};
      cell
        .value = Number(this._tottalSpent);
    }
  }

  get _tableColumns () {
    return [
      {calculate: () => '', text: '', width: 3},
      {calculate: d => d.fullNameRu, text: 'Исполнитель', width: 25},
      {calculate: d => d.userRolesNames, text: 'Роль', width: 13},
      {calculate: d => d.typeName, text: 'Тип', width: 13, alignment: {wrapText: true}},
      {calculate: d => d.comment, text: 'Описание', width: 40, alignment: {wrapText: true}},
      {calculate: () => '', text: 'Hours Plan', width: 13, numFmt: '0.00', alignment: {wrapText: true}, ref: 'hoursPlan'},
      {
        calculate: d => {
          const value = Number(d.spentTime);
          this._tottalSpent += value;
          return value;
        },
        numFmt: '0.00',
        text: 'Hours all',
        width: 13,
        alignment: {horizontal: 'right'}
      },
      {calculate: () => '', text: 'Total', width: 13, isSummary: true, numFmt: '0.00', alignment: {horizontal: 'right'}}
    ];
  }

  get _name () {
    return 'По задаче';
  }
}

module.exports = ByTaskWorkSheet;
