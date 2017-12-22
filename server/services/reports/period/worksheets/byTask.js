const WorkSheetTemplate = require('./workSheetTemplate');

class ByTaskWorkSheet extends WorkSheetTemplate {
    constructor(workbook, data) {
        super(workbook, data);
    }

    init() {
        super.init();
    }

    get _name() {
        return 'По задаче'
    }
}

module.exports = ByTaskWorkSheet;