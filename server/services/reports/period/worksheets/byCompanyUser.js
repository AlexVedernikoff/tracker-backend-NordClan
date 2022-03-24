const WorkSheetTemplate = require('./workSheetTemplate');
const i18n = require('./byCompanyUser.i18n');
const moment = require('moment');
const {cloneDeep} = require('lodash');

const getFullName = (user, suffix) => {
  const pascalCaseSuffix = suffix.replace(/^[a-zA-Z]{1}/, symbol => symbol.toUpperCase());
  return user[`lastName${pascalCaseSuffix}`] + ' ' + user[`firstName${pascalCaseSuffix}`];
};

const getDepartmentsName = departments => {
  if (departments.length > 0) return (departments.map(department => department.name).sort().join(', '));
  return '';
};

class ByCompanyUserWorkSheet extends WorkSheetTemplate {
  constructor (workbook, data, lang, averageNumberOfEmployees) {
    super(workbook, data, lang);
    this._lastIndexRow = 0;
    this._averageNumberOfEmployees = averageNumberOfEmployees;
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
        formula: `SUBTOTAL(9,J${startAt + 1}:J${endAt})`,
      },
      {
        label: locale.TOTAL_NOT_BILLABLE,
        formula: `SUBTOTAL(9,K${startAt + 1}:K${endAt})`,
      },
      {
        label: locale.TOTAL_AMOUNT,
        formula: `SUBTOTAL(9,J${startAt + 1}:J${endAt})+SUBTOTAL(9,K${startAt + 1}:K${endAt})`,
      },
      {
        label: locale.BUSY,
        numFmt: '00.00%',
        get formula () { return `${self._columns[index + 1]}${self._lastIndexRow - 3} / ${self._columns[index + 1]}${self._lastIndexRow - 1}`; },
      },
      {
        label: locale.AVERAGE_NUMBER_OF_EMPLOYEES,
        formula: this._averageNumberOfEmployees,
      },
    ];
    if (~index) {
      for (let i = 0; i < formulas.length; i++) {
        this._lastIndexRow++;
        const totalLabelCell = this._worksheet.getCell(this._columns[index] + this._lastIndexRow);
        const totalCell = this._worksheet.getCell(this._columns[index + 1] + this._lastIndexRow);
        totalCell.alignment = this._tableColumns[index].alignment || {};
        const format = formulas[i].numFmt;
        if (format) {
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
    this._printTablesPopulationCompany();
  }

  _printTablesPopulationCompany () {
    let indexCol = 0;
    let lastIndexRow = this._lastIndexRow;
    let maxCountColumn = this._getCountColumn();
    this._printIndicatorsTable(indexCol);
    this._lastIndexRow = lastIndexRow;
    maxCountColumn = this._getCountColumn(this._lastIndexRow, maxCountColumn);
    indexCol += 4;
    this._printBasePopulationTable(indexCol);
    maxCountColumn = this._getCountColumn(this._lastIndexRow, maxCountColumn);
    indexCol += 4;
    this._data.departmentList.forEach((item) => {
      this._lastIndexRow = lastIndexRow;
      this._printTable(item, indexCol);
      maxCountColumn = this._getCountColumn(this._lastIndexRow, maxCountColumn);
      indexCol += 4;
      if (this._columns.length < indexCol) {
        lastIndexRow += (maxCountColumn - lastIndexRow) + 1; // 1 - space
        indexCol = 0;
      }
    });
    this._lastIndexRow = lastIndexRow;
    this._printCitiesPopulationTable(this._data.citiesList, indexCol);
  }

  _getCountColumn (lastCount = 0, count = 0) {
    if (!lastCount) {
      return 0;
    }
    return lastCount > count ? lastCount : count;
  }

  _printIndicatorsTable (indexCol) {
    this._lastIndexRow++;
    let counter = 0;
    const productionIds = [24, 10, 28, 29, 3, 2, 5, 6];
    const administrationIds = [17, 21, 22, 16, 15];
    const tableRows = ['ADMINISTRATION', 'PRODUCTION'];

    this._setHeaderPopulationTable('INDICATORS', true, indexCol);

    tableRows.forEach((item, index, array) => {
      this._lastIndexRow++;
      this._worksheet.mergeCells(`${this._columns[indexCol] + this._lastIndexRow}:${this._columns[indexCol + 1] + this._lastIndexRow}`);
      const totalLabelCell = this._worksheet.getCell(this._columns[indexCol + 1] + this._lastIndexRow);
      const totalCell = this._worksheet.getCell(this._columns[indexCol + 2] + this._lastIndexRow);
      this._setCellStyle(totalLabelCell, totalCell, index, array);
      totalLabelCell.value = `${this._getTitle(item)}(${this._getTitle('POPULATION')})`;
      totalCell.value = !index
        ? administrationIds.reduce((acc, id) => acc + this._countUsers(id), 0)
        : productionIds.reduce((acc, id) => acc + this._countUsers(id), 0);
      counter += totalCell.value;
    });

    const labelCellValue = this._worksheet.getCell(this._columns[indexCol + 2] + (this._lastIndexRow - tableRows.length));
    labelCellValue.alignment = { vertical: 'middle', horizontal: 'center' };
    labelCellValue.border = {
      right: {style: 'thin'},
      top: {style: 'thin'},
    };
    labelCellValue.value = counter;
  }

  _printBasePopulationTable (indexCol) {
    this._lastIndexRow++;

    this._setHeaderPopulationTable('TOTAL_POPULATION', true, indexCol);
    let counterTable = 0;

    this._data.departmentList.forEach((item, index, array) => {
      this._lastIndexRow++;
      this._worksheet.mergeCells(`${this._columns[indexCol] + this._lastIndexRow}:${this._columns[indexCol + 1] + this._lastIndexRow}`);
      const totalLabelCell = this._worksheet.getCell(this._columns[indexCol + 1] + this._lastIndexRow);
      const totalCell = this._worksheet.getCell(this._columns[indexCol + 2] + this._lastIndexRow);
      this._setCellStyle(totalLabelCell, totalCell, index, array);
      totalLabelCell.value = `${item.name}(${this._getTitle('POPULATION')})`;
      totalCell.value = this._countUsers(item.id);
      counterTable += totalCell.value;
    });
    const labelCellValue = this._worksheet.getCell(this._columns[indexCol + 2] + (this._lastIndexRow - this._data.departmentList.length));
    labelCellValue.alignment = { vertical: 'middle', horizontal: 'center' };
    labelCellValue.border = {
      right: {style: 'thin'},
      top: {style: 'thin'},
    };
    labelCellValue.value = counterTable;
  }

  _printCitiesPopulationTable (citiesList, indexCol) {
    this._lastIndexRow++;
    this._setHeaderPopulationTable('CITIES_POPULATION', true, indexCol);
    let counterTable = 0;

    citiesList
      .forEach((item, index, array) => {
        this._lastIndexRow++;
        this._worksheet.mergeCells(`${this._columns[indexCol] + this._lastIndexRow}:${this._columns[indexCol + 1] + this._lastIndexRow}`);
        const totalLabelCell = this._worksheet.getCell(this._columns[indexCol + 1] + this._lastIndexRow);
        const totalCell = this._worksheet.getCell(this._columns[indexCol + 2] + this._lastIndexRow);
        this._setCellStyle(totalLabelCell, totalCell, index, array);
        totalLabelCell.value = item.id === 27 ? this._getTitle('OTHER') : item.name;
        totalCell.value = this._countUsersByCity(item.id);
        counterTable += totalCell.value;
      });
    const labelCellValue = this._worksheet.getCell(this._columns[indexCol + 2] + (this._lastIndexRow - this._data.citiesList.length));
    labelCellValue.alignment = { vertical: 'middle', horizontal: 'center' };
    labelCellValue.border = {
      right: {style: 'thin'},
      top: {style: 'thin'},
    };
    labelCellValue.value = counterTable;
  }

  _setHeaderPopulationTable (title, isTranslate = true, indexCol) {
    this._worksheet.mergeCells(`${this._columns[indexCol] + this._lastIndexRow}:${this._columns[indexCol + 1] + this._lastIndexRow}`);
    const labelCell = this._worksheet.getCell(this._columns[indexCol] + this._lastIndexRow);
    labelCell.fill = {type: 'pattern', pattern: 'lightGray'};
    labelCell.alignment = { vertical: 'middle', horizontal: 'center' };
    labelCell.border = {
      left: {style: 'thin'},
      right: {style: 'thin'},
      top: {style: 'thin'},
    };
    labelCell.width = 14;
    labelCell.value = isTranslate ? this._getTitle(title) : title;
  }

  _countUsers (departmentId) {
    //if (!Array.isArray(this._data.users)) {return 0;}
    return this._data.users.filter((user) => {
      return user.department.some((item) => item.id === Number(departmentId));
    }).length;
  }

  _countUsersByCity (cityId) {
    return this._data.users.filter((user) => {
      return user.department.some((item) => item.id === Number(cityId));
    }).length;
  }

  _printTable ({ id, name }, indexCol) {
    this._lastIndexRow++;
    this._setHeaderPopulationTable(name, false, indexCol);
    let counterTable = 0;

    this._data.citiesList.forEach((item, index, array) => {
      this._lastIndexRow++;
      this._worksheet.mergeCells(`${this._columns[indexCol] + this._lastIndexRow}:${this._columns[indexCol + 1] + this._lastIndexRow}`);
      const totalLabelCell = this._worksheet.getCell(this._columns[indexCol + 1] + this._lastIndexRow);
      const totalCell = this._worksheet.getCell(this._columns[indexCol + 2] + this._lastIndexRow);
      this._setCellStyle(totalLabelCell, totalCell, index, array);
      totalLabelCell.value = `${name}(${this._getTitle(item.id)})`;
      totalCell.value = item.id === 27 ? this._countRemoteUsersById(id) : this._countUsersOfDepartment(item.id, id);
      counterTable += totalCell.value;
    });
    const labelCellValue = this._worksheet.getCell(this._columns[indexCol + 2] + (this._lastIndexRow - this._data.citiesList.length));
    labelCellValue.alignment = { vertical: 'middle', horizontal: 'center' };
    labelCellValue.border = {
      right: {style: 'thin'},
      top: {style: 'thin'},
    };
    labelCellValue.value = counterTable;
  }

  _setCellStyle (totalLabelCell, totalCell, index, array) {
    totalCell.alignment = { vertical: 'middle', horizontal: 'center' };
    totalLabelCell.border = {
      left: {style: 'thin'},
    };
    totalCell.border = {
      left: {style: 'thin'},
      right: {style: 'thin'},
    };
    if (index === array.length - 1) {
      totalLabelCell.border = {
        left: {style: 'thin'},
        bottom: {style: 'thin'},
      };
      totalCell.border = {
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'},
      };
    }
    totalLabelCell.width = 14;
    totalLabelCell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  _countRemoteUsersById (id) {
    return this._data.users.filter((user) => {
      return user.department.some((item) => item.id === Number(id))
          && !user.department.some((item) => item.id === 26)
          && !user.department.some((item) => item.id === 25);
    }).length;
  }

  _countUsersOfDepartment (cityId, departmentId) {
    return this._data.users.filter((user) => {
      return user.department.some((item) => item.id === Number(departmentId)) && user.department.some((item) => item.id === Number(cityId));
    }).length;
  }

  _getTitle (key) {
    const locale = i18n[this.lang];
    return locale[key];
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
        top: { style: 'medium' },
      };
  }

  _setHeader (sheet, info) {
    const locale = i18n[this.lang];
    const dateFrom = info.range.startDate && moment(info.range.startDate).locale(this.lang).format('DD MMMM YYYY');
    const dateTo = info.range.endDate && moment(info.range.endDate).locale(this.lang).format('DD MMMM YYYY');
    const font = { name: 'Calibri', color: { argb: 'F44546A' }, bold: true };
    const border = { bottom: { style: 'medium' } };

    sheet.mergeCells(`${this._columns[0]}1:${this._columns[this._tableColumns.length - 1]}1`);
    const report = sheet.getCell('A1');
    report.value = locale.SHEET_TITLE;
    report.font = { size: 15, ...font };

    sheet.mergeCells(`${this._columns[0]}2:${this._columns[this._tableColumns.length - 1]}2`);
    const period = sheet.getCell('A2');
    period.value = `${locale.PERIOD}:  ${dateFrom}  -  ${dateTo}`;
    period.font = { size: 13, ...font };
    period.border = { ...border };
  }

  get _tableColumns () {
    const locale = i18n[this.lang];
    return [
      { calculate: d => getFullName(d.user, this.lang), width: 24, text: locale.PERSON },
      { calculate: d => d.user.employment_date ? d.user.employment_date : '', width: 16, text: locale.EMPLOYMENT_DATE },
      {
        calculate: d => getDepartmentsName(d.user.department).replace(/\*Направление/gi, ''),
        width: 22,
        text: locale.DEPARTMENT,
        alignment: { wrapText: true, vertical: 'top' },
      },

      {
        calculate: d => {
          if (d.task.isMagic) return '';
          if (d.project === null) return '';

          return `${d.project.prefix}-${d.task.id}`;
        },
        text: '#',
      },
      { calculate: d => d.project ? d.project.name : '', text: locale.PROJECT, width: 24, alignment: { wrapText: true } },
      { calculate: d => d.task.name, text: locale.TASK, width: 50, alignment: { wrapText: true } },
      { calculate: d => d.task.typeName || locale.MAGIC, text: locale.TYPE, width: 16, alignment: { wrapText: true } },
      { calculate: d => d.comment, text: locale.DESCRIPTION, width: 50, alignment: { wrapText: true } },
      {
        calculate: d => moment(d.onDate).format('DD.MM.YYYY'),
        text: locale.DATE,
        width: 13,
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
        alignment: { horizontal: 'right' },
        isSummary: true,
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
        alignment: { horizontal: 'right' },
      },
    ];
  }

  get _name () {
    const locale = i18n[this.lang];
    return locale.SHEET_TITLE;
  }

  get _columns () {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  }
}

module.exports = ByCompanyUserWorkSheet;
