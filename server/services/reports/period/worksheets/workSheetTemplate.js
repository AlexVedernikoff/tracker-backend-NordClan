const moment = require('moment');

class WorkSheetTemplate {
    constructor(workbook, data) {
        this._workbook = workbook;
        this._data = data;
    }

    init() {
        this._worksheet = this._workbook.addWorksheet(this._name);
        this._setHeader(this._worksheet, this._data.info);
    }

    _setHeader(sheet, info) {
        const dateFrom = moment(info.range.startDate).locale('ru').format('DD MMMM YYYY');
        const dateTo = moment(info.range.endDate).locale('ru').format('DD MMMM YYYY');
        sheet.mergeCells('A1:G1');
        sheet.getCell('A1').value = `Отчет по проекту ${info.project.name}`;
        sheet.mergeCells('A2:G2');
        sheet.getCell('A2').value = `Период: ${dateFrom} - ${dateTo}`;
    }

    get _name() {
        return '';
    }

    get _rows() {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    }
}

module.exports = WorkSheetTemplate;