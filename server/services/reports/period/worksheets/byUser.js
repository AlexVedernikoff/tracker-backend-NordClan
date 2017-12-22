const WorkSheetTemplate = require('./workSheetTemplate');
const tableHeaders = [
    {text: '', width: 3},
    {text: '#', width: 8},
    {text: 'Задача', width: 50},
    {text: 'Описание', width: 23},
    {text: 'Дата', width: 13},
    {text: 'Hours Plan', width: 13},
    {text: 'Hours all', width: 13},
    {text: 'Total fact', width: 13},
];

class ByUserWorkSheet extends WorkSheetTemplate {
    constructor(workbook, data) {
        super(workbook, data);
    }

    init() {
        super.init();
        tableHeaders.map((header, index) => {
            const address = this._rows[index] + 3;
            this._worksheet.getColumn(this._rows[index]).width = tableHeaders[index].width;
            this._worksheet.getCell(address).value = tableHeaders[index].text;
        });

        let lastInsertRow = 3;
        this._data.byUser.forEach(d => {
            const user = d.user;
            this._writeUserRow(++lastInsertRow, user.fullNameRu);
        });
    }

    _writeUserRow(row, userName) {
        this._worksheet.mergeCells(`${this._rows[0] + row}:${this._rows[2] + row}`);
        this._worksheet.getCell(this._rows[0] + row).value = userName;
    }

    get _name() {
        return 'По исполнителю'
    }
}

module.exports = ByUserWorkSheet;