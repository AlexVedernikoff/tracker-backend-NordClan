const WorkSheetTemplate = require('./workSheetTemplate');

class ByUserWorkSheet extends WorkSheetTemplate {
  constructor (workbook, data) {
    super(workbook, data);
    this._lastIndexRow = 0;
  }

  init () {
    super.init();

    this._data.byUser.forEach(data => {
      this._write(data);
    });

    this._writeTottalSummary();
  }

  _write (data) {
    this._lastIndexRow++;
    this._writeUser(data.user.fullNameRu);
    data.tasks.forEach(task => {
      this._writeUserRow(task);
    });
    this._writeSummary(data.tasks);
    this._lastIndexRow++;
  }

  _writeUser (userName) {
    this._worksheet
      .mergeCells(`${this._rows[0] + this._lastIndexRow}:${this._rows[2] + this._lastIndexRow}`);
    this._worksheet
      .getCell(this._rows[0] + this._lastIndexRow)
      .value = userName;
  }

  _writeUserRow (task) {
    this._lastIndexRow++;
    this._tableColumns.forEach((v, i) => {
      const cell = this._worksheet.getCell(this._rows[i] + this._lastIndexRow);
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
      const cell = this._worksheet.getCell(this._rows[index] + this._lastIndexRow);
      cell
        .alignment = this._tableColumns[index].alignment || {};
      cell
        .value = tasks.reduce((count, task) => count + Number(task.spentTime), 0)
          .toFixed(2)
          .replace('.', ',');
    }
  }

  _writeTottalSummary () {
    this._lastIndexRow++;
    const index = this._tableColumns.findIndex(v => v.isSummary);
    if (~index) {
      this._worksheet.getCell(this._rows[index - 1] + this._lastIndexRow)
        .value = 'Общая сумма:';
      const cell = this._worksheet.getCell(this._rows[index] + this._lastIndexRow);
      cell
        .alignment = this._tableColumns[index].alignment || {};
      cell
        .value = Number(this._tottalSpent)
          .toFixed(2)
          .replace('.', ',');
    }
  }

  get _tableColumns () {
    return [
      {calculate: () => '', text: '', width: 3},
      {calculate: d => d.task.isMagic ? '' : `${this._prefix}-${d.task.id}`, text: '#'},
      {calculate: d => d.task.name, text: 'Задача', width: 50, alignment: {wrapText: true}},
      {calculate: d => d.comment, text: 'Описание', width: 40, alignment: {wrapText: true}},
      {calculate: d => d.onDate, text: 'Дата', width: 13},
      {
        calculate: d => {
          const value = Number(d.spentTime);
          this._tottalSpent += value;
          return value.toFixed(2).toString().replace('.', ',');
        },
        text: 'Hours all',
        width: 13,
        alignment: {horizontal: 'right'}
      },
      {calculate: () => '', text: 'Total fact', width: 13, isSummary: true, alignment: {horizontal: 'right'}}
    ];
  }

  get _name () {
    return 'По исполнителю';
  }
}

module.exports = ByUserWorkSheet;
