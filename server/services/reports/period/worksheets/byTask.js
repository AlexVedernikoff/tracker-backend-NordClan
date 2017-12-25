const WorkSheetTemplate = require('./workSheetTemplate');
const _ = require('lodash');

class ByTaskWorkSheet extends WorkSheetTemplate {
    constructor(workbook, data) {
        super(workbook, data);
    }

    init() {
        super.init();

        this._data.byTasks.forEach(data => {
            this._write(data);
        });

        this._writeTottalSummary();
    }

    _write(data) {
        this._lastIndexRow++;
        this._writeTask(data.task);
        this._writeUsersRows(data.users);
        this._lastIndexRow++;
    }

    _writeTask(task) {
        this._worksheet
            .mergeCells(`${this._rows[0] + this._lastIndexRow}:${this._rows[2] + this._lastIndexRow}`);
        this._worksheet
            .getCell(this._rows[0] + this._lastIndexRow)
            .value = `${this._prefix}_${task.id} - ${task.name}`;
        const planIndex = this._tableColumns.findIndex(row => row.ref === 'hoursPlan');
        if (~planIndex) {
            this._worksheet
                .getCell(this._rows[planIndex] + this._lastIndexRow)
                .value = task.plannedExecutionTime
                .toFixed(2)
                .toString()
                .replace('.', ',');
        }
    }

    _writeUsersRows(users) {
        // this._lastIndexRow++;
        let totalTaskTime = 0;
        _(users)
            .groupBy('userId')
            .values()
            .value()
            .map(timeSheets =>
                _.transform(timeSheets, (result, ts) => {
                    result.fullNameRu = ts.user.fullNameRu;
                    result.comment += '- ' + ts.comment + '\r\n';
                    result.spentTime += Number(ts.spentTime);
                }, {role: 'who?', comment: '', spentTime: 0, fullNameRu: ''})
            )
            .map(user => {
                this._lastIndexRow++;
                totalTaskTime += user.spentTime;
                this._tableColumns.forEach((v, i) => {
                    const cell = this._worksheet.getCell(this._rows[i] + this._lastIndexRow);
                    cell
                        .value = v.calculate(user);
                    cell
                        .alignment = v.alignment || {};
                });

            });
        this._writeSummary(totalTaskTime);
    }

    _writeSummary(tottalTaskTime) {
        this._lastIndexRow++;
        const index = this._tableColumns.findIndex(v => v.isSummary);
        if (~index) {
            const cell = this._worksheet.getCell(this._rows[index] + this._lastIndexRow);
            cell
                .alignment = this._tableColumns[index].alignment || {};
            cell
                .value = tottalTaskTime
                .toFixed(2)
                .toString()
                .replace('.', ',');
        }
    }

    _writeTottalSummary() {
        this._lastIndexRow++;
        const index = this._tableColumns.findIndex(v => v.isSummary);
        if (~index) {
            this._worksheet.getCell(this._rows[index - 1] + this._lastIndexRow)
                .value = 'Общая сумма:';
            const cell = this._worksheet.getCell(this._rows[index] + this._lastIndexRow);
            cell
                .alignment = this._tableColumns[index].alignment || {};
            cell
                .value = this._tottalSpent
                .toFixed(2)
                .toString()
                .replace('.', ',');
        }
    }

    get _tableColumns() {
        return [
            {calculate: () => '', text: '', width: 3},
            {calculate: d => d.fullNameRu, text: 'Исполнитель', width: 25},
            // TODO: awaiting role feature
            // {calculate: () => 'Role?', text: 'Роль', width: 13},
            {calculate: d => d.comment, text: 'Описание', width: 23, alignment: {wrapText: true}},
            {calculate: () => '', text: 'Hours Plan', width: 13, alignment: {wrapText: true}, ref: 'hoursPlan'},
            {
                calculate: d => {
                    const value = Number(d.spentTime);
                    this._tottalSpent += value;
                    return value.toFixed(2).toString().replace('.', ',')
                },
                text: 'Hours all',
                width: 13,
                alignment: {horizontal: 'right'}
            },
            {calculate: () => '', text: 'Total', width: 13, isSummary: true, alignment: {horizontal: 'right'}}
        ]
    }

    get _name() {
        return 'По задаче'
    }
}

module.exports = ByTaskWorkSheet;