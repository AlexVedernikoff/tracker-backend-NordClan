/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const mocha = require('mocha');
const expect = chai.expect;
const { getScales } = require('./../../../server/services/timesheets/getTracksAll');
const describe = mocha.describe;
const it = mocha.it;

describe('Timesheet Service', () => {
  describe('getting scales for all tracks', () => {
    it('should return empty scale', () => {
      const tracks = [];
      const expectedScales = { all: 0 };
      expect(getScales(tracks)).to.deep.eql(expectedScales);
    });

    it('should return correct scales', () => {
      const tracks = [
        { id: 1, typeId: 1, spentTime: '10' },
        { id: 2, typeId: 1, spentTime: '5' },
        { id: 3, typeId: 2, spentTime: '10' },
        { id: 4, typeId: 2, spentTime: '8' },
        { id: 5, typeId: 3, spentTime: '7' }
      ];

      const expectedScales = {
        1: 15,
        2: 18,
        3: 7,
        all: 40
      };

      expect(getScales(tracks)).to.deep.eql(expectedScales);
    });
  });
});
