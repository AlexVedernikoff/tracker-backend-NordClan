const WorkSheetTemplate = require('./workSheetTemplate');

class ByUserWorkSheet extends WorkSheetTemplate {
    constructor(workbook, data) {
        super(workbook, data);
    }

    init() {
        super.init();
    }

    get _name() {
        return 'По исполнителю'
    }
}

module.exports = ByUserWorkSheet;