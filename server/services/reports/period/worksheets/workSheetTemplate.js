const moment = require('moment');

class WorkSheetTemplate {
  constructor (workbook, data) {
    this._workbook = workbook;
    this._data = data;
  }

  init () {
    this._worksheet = this._workbook.addWorksheet(this._name);
    this._setHeader(this._worksheet, this._data.info);
    this._prefix = this._data.info.project.prefix;
    this._lastIndexRow = 3;
    this._tottalSpent = 0;
    this._tableColumns.map((column, index) => {
      const address = this._columns[index] + this._lastIndexRow;
      this._worksheet
        .getColumn(this._columns[index])
        .width = column.width;
      const headerCell = this._worksheet.getCell(address);
      headerCell
        .value = column.text;
      headerCell
        .border = {bottom: {style: 'medium'}, color: {argb: 'FA2b8E1'}};
      if (column.numFmt) {
        this._worksheet.getColumn(this._columns[index]).numFmt = '0.00';
      }
    });
  }

  _setHeader (sheet, info) {
    const dateFrom = info.range.startDate && moment(info.range.startDate).locale('ru').format('DD MMMM YYYY');
    const dateTo = info.range.endDate && moment(info.range.endDate).locale('ru').format('DD MMMM YYYY');
    const font = {name: 'Calibri', color: {argb: 'F44546A'}, bold: true};
    const border = {bottom: {style: 'medium'}};

    sheet.mergeCells(`${this._columns[0]}1:${this._columns[this._tableColumns.length - 1]}1`);
    const project = sheet.getCell('A1');
    project.value = `Отчет по проекту ${info.project.name}`;
    project.font = {size: 15, ...font};
    project.border = {color: {argb: 'F44546A'}, ...border};

    sheet.mergeCells(`${this._columns[0]}2:${this._columns[this._tableColumns.length - 1]}2`);
    const period = sheet.getCell('A2');
    period.value = `Период: ${dateFrom && dateTo ? (dateFrom + ' - ' + dateTo) : 'За весь проект'}`;
    period.font = {size: 13, ...font};
    period.border = {color: {argb: 'FA2b8E1'}, ...border};
  }

  get _name () {
    return '';
  }

  get _tableColumns () {
    return [];
  }

  get _columns () {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  }
}

module.exports = WorkSheetTemplate;
