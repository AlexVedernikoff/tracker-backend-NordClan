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
  });
});
