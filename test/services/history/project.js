const chai = require('chai');
const expect = chai.expect;
const generateMessage = require('./../../../server/services/history/project/message');

describe('ProjectHistory', () => {
  describe('Message generator', () => {
    it('should return correct message on change name', () => {
      const history = {
        entity: 'Project',
        entityId: 1,
        action: 'update',
        field: 'name',
        projectId: 1,
        valueStr: 'Test2',
        prevValueStr: 'Test1'
      };

      const actual = generateMessage(history);
      const expected = {
        message: 'изменил(-а) название проекта c \'Test1\' на \'Test2\'',
        entities: {}
      };

      expect(expected).to.deep.equal(actual);
    });

    it('should return correct message on change status', () => {
      const history = {
        entity: 'Project',
        entityId: 1,
        action: 'update',
        field: 'statusId',
        projectId: 1,
        valueStr: 1,
        prevValueStr: 2
      };

      const actual = generateMessage(history);
      const expected = {
        message: 'изменил(-а) статус проекта c \'Develop play\' на \'New\'',
        entities: {}
      };

      expect(expected).to.deep.equal(actual);
    });

    it('should return correct message on change budget', () => {
      const history = {
        entity: 'Project',
        entityId: 1,
        action: 'update',
        field: 'budget',
        projectId: 1,
        valueStr: 100,
        prevValueStr: 200
      };

      const actual = generateMessage(history);
      const expected = {
        message: 'изменил(-а) бюджет проекта c рисковым резервом c \'200\' на \'100\'',
        entities: {}
      };

      expect(expected).to.deep.equal(actual);
    });
  });
});
