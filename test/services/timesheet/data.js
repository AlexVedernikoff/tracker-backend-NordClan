/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const mocha = require('mocha');
const expect = chai.expect;
const moment = require('moment');
const { getDateRange } = require('./../../../server/services/timesheets/getTracksAll');
const describe = mocha.describe;
const it = mocha.it;

describe('Timesheet Service', () => {
  describe('Date range generator', () => {
    it('should return error after invalid data range', () => {
      const startDay = moment('2017-11-23');
      const endDay = moment('2017-11-23');
      const getInvalidRange = () => getDateRange(startDay, endDay);

      expect(getInvalidRange).to.throw;
    });

    it('should return correct data range', () => {
      const startDay = moment('2017-11-21');
      const endDay = moment('2017-11-23');
      const range = getDateRange(startDay, endDay);
      const expectedRange = [ '2017-11-23', '2017-11-22', '2017-11-21' ];

      expect(expectedRange).to.deep.eql(range);
    });
  });
});
