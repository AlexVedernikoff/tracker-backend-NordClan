const chai = require('chai');
const expect = chai.expect;
const moment = require('moment');
const TimesheetController = require('./../../../server/controllers/api/v2/TimesheetController');

describe('Timesheet Service', () => {
  describe('Date range generator', () => {
    it('should return error after invalid data range', () => {
      const startDay = moment('2017-11-23');
      const endDay = moment('2017-11-23');
      const getInvalidRange = () => TimesheetController.getDateRange(startDay, endDay);

      expect(getInvalidRange).to.throw;
    });

    it('should return correct data range', () => {
      const startDay = moment('2017-11-21');
      const endDay = moment('2017-11-23');
      const range = TimesheetController.getDateRange(startDay, endDay);
      const expectedRange = [ '2017-11-23', '2017-11-22', '2017-11-21' ];

      expect(expectedRange).to.deep.eql(range);
    });
  });
});
