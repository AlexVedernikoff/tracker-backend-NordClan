const moment = require('moment');

class WorkSheetTemplate {
    constructor(workbook, data) {
        this._workbook = workbook;
        this._data = data;
    }

    init() {
        this._worksheet = this._workbook.addWorksheet(this._name);
        this._setHeader(this._worksheet, this._data.info);
        this._prefix = this._data.info.project.prefix;
        this._lastIndexRow = 3;
        this._tottalSpent = 0;
        this._tableRows.map((row, index) => {
            const address = this._rows[index] + this._lastIndexRow;
            this._worksheet
                .getColumn(this._rows[index])
                .width = row.width;
            const headerCell = this._worksheet.getCell(address);
            headerCell
                .value = row.text;
            headerCell
                .border = {bottom: {style: 'medium'}, color: {argb: 'FA2b8E1'}}
        });
    }

    _setHeader(sheet, info) {
        const dateFrom = moment(info.range.startDate).locale('ru').format('DD MMMM YYYY');
        const dateTo = moment(info.range.endDate).locale('ru').format('DD MMMM YYYY');
        sheet.mergeCells('A1:G1');

        const font = {name: 'Calibri', color: {argb: 'F44546A'}, bold: true};
        const border = {bottom: {style: 'medium'}};

        const project = sheet.getCell('A1');
        project.value = `Отчет по проекту ${info.project.name}`;
        project.font = {size: 15, ...font};
        project.border = {color: {argb: 'F44546A'}, ...border};

        sheet.mergeCells('A2:G2');
        const period = sheet.getCell('A2');
        period.value = `Период: ${dateFrom} - ${dateTo}`;
        period.font = {size: 13, ...font};
        period.border = {color: {argb: 'FA2b8E1'}, ...border};
    }

    get _name() {
        return '';
    }

    get _rows() {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    }
}

module.exports = WorkSheetTemplate;