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

    it('should return correct message on create sprint', () => {
      const sprint = {
        name: 'Спринт1'
      };

      const history = {
        entity: 'Sprint',
        entityId: 1,
        action: 'create',
        projectId: 1,
        sprint
      };

      const actual = generateMessage(history);
      const expected = {
        message: 'создал(-а) спринт \'{sprint}\'',
        entities: {
          sprint
        }
      };

      expect(expected).to.deep.equal(actual);
    });

    it('should return correct message on add user role', () => {
      const user = {
        name: 'Vasya'
      };

      const history = {
        entity: 'ProjectUser',
        entityId: 1,
        action: 'update',
        field: 'rolesIds',
        projectId: 1,
        valueStr: '[1,2,3]',
        prevValueStr: '[1,2]',
        user
      };

      const actual = generateMessage(history);
      const expected = {
        message: 'добавил(-а) роль UX для пользователя {user}',
        entities: {
          user
        }
      };

      expect(expected).to.deep.equal(actual);
    });

    it('should return correct message on delete user role', () => {
      const user = {
        name: 'Vasya'
      };

      const history = {
        entity: 'ProjectUser',
        entityId: 1,
        action: 'update',
        field: 'rolesIds',
        projectId: 1,
        valueStr: '[2,1]',
        prevValueStr: '[3,1,2]',
        user
      };

      const actual = generateMessage(history);
      const expected = {
        message: 'удалил(-а) роль UX для пользователя {user}',
        entities: {
          user
        }
      };

      expect(expected).to.deep.equal(actual);
    });
  });
});
