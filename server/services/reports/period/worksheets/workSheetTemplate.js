const moment = require('moment');
const i18n = require('./workSheetTemplate.i18n.json');

class WorkSheetTemplate {
  constructor (workbook, data, lang) {
    this._workbook = workbook;
    this._data = data;
    this.lang = lang;
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
    const locale = i18n[this.lang];
    const dateFrom = info.range.startDate && moment(info.range.startDate).locale(this.lang).format('DD MMMM YYYY');
    const dateTo = info.range.endDate && moment(info.range.endDate).locale(this.lang).format('DD MMMM YYYY');
    const label = info.label;
    const font = {name: 'Calibri', color: {argb: 'F44546A'}, bold: true};
    const border = {bottom: {style: 'medium'}};

    sheet.mergeCells(`${this._columns[0]}1:${this._columns[this._tableColumns.length - 1]}1`);
    const project = sheet.getCell('A1');
    project.value = `${locale.PROJECT_REPORT} "${info.project.name}"`;
    project.font = {size: 15, ...font};
    project.border = {color: {argb: 'F44546A'}, ...border};

    sheet.mergeCells(`${this._columns[0]}2:${this._columns[this._tableColumns.length - 1]}2`);
    const period = sheet.getCell('A2');
    period.value = `${locale.PERIOD}:  ${dateFrom}  -  ${dateTo} ${label}`;
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
