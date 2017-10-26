const chai = require('chai');
const expect = chai.expect;
const { getAnswer } = require('./../../../server/services/history/task/message');

describe('TaskHistory', () => {
  describe('Message generator', () => {
    it('should return correct message on create task', () => {
      const historyModel = {
        action: 'create',
        entity: 'Task',
        task: {
          name: 'Тестовая'
        }
      };

      const actual = getAnswer(historyModel);
      const expected = {
        message: 'создал(-а) задачу \'Тестовая\'',
        entities: {}
      };

      expect(expected).to.deep.equal(actual);
    });

    it('should return correct message on set sprint', () => {
      const sprint =  {
        id: 1,
        name: 'Спринт 1'
      };

      const historyModel = {
        action: 'update',
        field: 'sprintId',
        entity: 'sprint',
        sprint: sprint,
        valueStr: 'new sprint'
      };

      const actual = getAnswer(historyModel);
      const expected = {
        message: 'установил(-а) спринт задачи \'{sprint}\'',
        entities: {
          sprint: sprint
        }
      };

      expect(expected).to.deep.equal(actual);
    });

    it('should return correct message on change status', () => {
      const historyModel = {
        action: 'update',
        field: 'statusId',
        entity: 'Task',
        valueStr: 2,
        prevValueStr: 1
      };

      const actual = getAnswer(historyModel);
      const expected = {
        message: 'изменил(-а) статус задачи с \'New\' на \'Develop play\'',
        entities: {}
      };

      expect(expected).to.deep.equal(actual);
    });

    it('should return correct message on change description', () => {
      const historyModel = {
        action: 'update',
        field: 'description',
        entity: 'Task',
        valueStr: 'б',
        prevValueStr: 'а'
      };

      const actual = getAnswer(historyModel);
      const expected = {
        message: 'изменил(-а) описание задачи с \'а\' на \'б\'',
        entities: {}
      };

      expect(expected).to.deep.equal(actual);
    });
  });
});
