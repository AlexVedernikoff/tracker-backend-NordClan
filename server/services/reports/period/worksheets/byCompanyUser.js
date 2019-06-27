const WorkSheetTemplate = require('./workSheetTemplate');
const i18n = require('./byCompanyUser.i18n');
const moment = require('moment');

const getFullName = (user, suffix) => {
  const pascalCaseSuffix = suffix.replace(/^[a-zA-Z]{1}/, symbol => symbol.toUpperCase());
  return user[`lastName${pascalCaseSuffix}`] + ' ' + user[`firstName${pascalCaseSuffix}`];
};

class ByCompanyUserWorkSheet extends WorkSheetTemplate {
  constructor (workbook, data, lang) {
    super(workbook, data, lang);
    this._lastIndexRow = 0;
  }

  _writeUserTimesheets (userElement) {
    if (userElement.timeSheets.length > 0) {
      userElement.timeSheets.forEach(data => {
        this._writeUserRow(data);
      });
    }
  }

  _writeUserRow (timesheet) {
    this._lastIndexRow++;
    this._tableColumns.forEach((v, i) => {
      const cell = this._worksheet.getCell(this._columns[i] + this._lastIndexRow);
      cell
        .value = v.calculate(timesheet);
      cell
        .alignment = v.alignment || {};
    });
  }

  _writeSummary (startAt, endAt) {
    const index = this._tableColumns.findIndex(v => v.isSummary);
    const locale = i18n[this.lang];
    const self = this;
    const formulas = [
      {
        label: locale.TOTAL_BILLABLE,
        formula: `=SUBTOTAL(9,H${startAt}:H${endAt})`
      },
      {
        label: locale.TOTAL_NOT_BILLABLE,
        formula: `SUBTOTAL(9,I${startAt}:I${endAt})`
      },
      {
        label: locale.TOTAL_AMOUNT,
        formula: `SUBTOTAL(9,H${startAt}:H${endAt})+SUBTOTAL(9,I${startAt}:I${endAt})`
      },
      {
        label: locale.BUSY,
        numFmt: '00.00%',
        get formula () { return `${self._columns[index + 1]}${self._lastIndexRow - 3} / ${self._columns[index + 1]}${self._lastIndexRow - 1}`; }
      }
    ];
    if (~index) {
      for (let i = 0; i < 4; i++) {
        this._lastIndexRow++;
        const totalLabelCell = this._worksheet.getCell(this._columns[index] + this._lastIndexRow);
        const totalCell = this._worksheet.getCell(this._columns[index + 1] + this._lastIndexRow);
        totalCell.alignment = this._tableColumns[index].alignment || {};
        const format = formulas[i].numFmt;
        if (format){
          totalCell.numFmt = format;
        }
        totalLabelCell.width = 14;
        totalLabelCell.alignment = this._tableColumns[index].alignment || {};
        totalLabelCell.value = formulas[i].label;
        totalCell.value = { formula: formulas[i].formula, result: undefined };
      }
    }
    this._lastIndexRow++;
  }

  init () {
    this._worksheet = this._workbook.addWorksheet(this._name);
    this._setHeader(this._worksheet, this._data.info);
    this._lastIndexRow = 2;
    this._writeColumnsHeaders();
    const startAt = this._lastIndexRow;
    this._data.companyByUser.forEach(userElement => {
      this._writeUserTimesheets(userElement);
    });
    const endAt = this._lastIndexRow;
    this._drawBorder();
    this._writeSummary(startAt, endAt);
  }

  _writeColumnsHeaders () {
    this._lastIndexRow++;
    this._tableColumns.map((column, index) => {
      const address = this._columns[index] + this._lastIndexRow;
      this._worksheet
        .getColumn(this._columns[index])
        .width = column.width;
      const headerCell = this._worksheet.getCell(address);
      headerCell
        .value = column.text;
      if (column.numFmt) {
        this._worksheet.getColumn(this._columns[index]).numFmt = '0.00';
      }
    });
    this._worksheet.autoFilter = `${this._columns[0]}${this._lastIndexRow}:${this._columns[this._columns.length - 1]}${this._lastIndexRow}`;
  }

  _drawBorder () {
    this._lastIndexRow++;
    this._worksheet
      .mergeCells(`${this._columns[0] + this._lastIndexRow}:${this._columns[this._columns.length - 1] + this._lastIndexRow}`);
    this._worksheet
      .getCell(this._columns[0] + this._lastIndexRow)
      .border = {
        top: { style: 'medium' }
      };
  }

  _setHeader (sheet, info) {
    const locale = i18n[this.lang];
    const dateFrom = info.range.startDate && moment(info.range.startDate).locale(this.lang).format('DD MMMM YYYY');
    const dateTo = info.range.endDate && moment(info.range.endDate).locale(this.lang).format('DD MMMM YYYY');
    const font = {name: 'Calibri', color: {argb: 'F44546A'}, bold: true};
    const border = {bottom: {style: 'medium'}};

    sheet.mergeCells(`${this._columns[0]}1:${this._columns[this._tableColumns.length - 1]}1`);
    const report = sheet.getCell('A1');
    report.value = locale.SHEET_TITLE;
    report.font = {size: 15, ...font};

    sheet.mergeCells(`${this._columns[0]}2:${this._columns[this._tableColumns.length - 1]}2`);
    const period = sheet.getCell('A2');
    period.value = `${locale.PERIOD}:  ${dateFrom}  -  ${dateTo}`;
    period.font = {size: 13, ...font};
    period.border = {...border};
  }

  get _tableColumns () {
    const locale = i18n[this.lang];
    return [
      {calculate: d => getFullName(d.user, this.lang), width: 24, text: locale.PERSON},
      {calculate: d => d.task.isMagic ? '' : `${d.project.prefix}-${d.task.id}`, text: '#'},
      {calculate: d => d.project ? d.project.name : '', text: locale.PROJECT, width: 24, alignment: {wrapText: true}},
      {calculate: d => d.task.name, text: locale.TASK, width: 50, alignment: {wrapText: true}},
      {calculate: d => d.task.typeName || locale.MAGIC, text: locale.TYPE, width: 16, alignment: {wrapText: true}},
      {calculate: d => d.comment, text: locale.DESCRIPTION, width: 50, alignment: {wrapText: true}},
      {
        calculate: d => moment(d.onDate).format('DD.MM.YYYY'),
        text: locale.DATE,
        width: 13
      },
      {
        calculate: d => {
          if (!d.isBillable) { return null; }
          const value = Number(d.spentTime);
          return value;
        },
        text: locale.HOURS_BILLABLE,
        numFmt: '0.00',
        width: 15,
        alignment: {horizontal: 'right'},
        isSummary: true
      },
      {
        calculate: d => {
          if (d.isBillable) { return null; }
          const value = Number(d.spentTime);
          return value;
        },
        text: locale.HOURS_NOT_BILLABLE,
        numFmt: '0.00',
        width: 15,
        alignment: {horizontal: 'right'}
      }
    ];
  }

  get _name () {
    const locale = i18n[this.lang];
    return locale.SHEET_TITLE;
  }

  get _columns () {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  }
}

module.exports = ByCompanyUserWorkSheet;
