/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const mocha = require('mocha');
const expect = chai.expect;
const AgentService = require('./../../../server/services/agent');
const describe = mocha.describe;
const it = mocha.it;

describe('AgentService', () => {
  describe('validation', () => {
    it('should return null', () => {
      const params = {
        typeId: 8,
        startDate: '2017-09-10',
        endDate: '2017-09-11',
        projectId: 1,
        sprintId: 1,
        userId: 2
      };

      const errors = AgentService.validate(params);

      expect(errors).to.be.null;
    });

    it('should return errors', () => {
      const params = {
        typeId: 42,
        startDate: '2017/09/10',
        endDate: '2017-09-1',
        projectId: '1',
        sprintId: 1,
        userId: 2
      };

      const errors = AgentService.validate(params);
      const message = `Incorrect params - typeId: ${params.typeId}, startDate: `
        + `${params.startDate}, endDate: ${params.endDate}, projectId: ${params.projectId}`;

      expect(message).to.deep.equal(errors);
    });

  });
});
