const chai = require('chai');
const expect = chai.expect;
const { diffBetweenObjects } = require('./../../server/components/utils');

describe('Utils', () => {
  it('should return difference between objects', () => {
    const first = {
      a: 5,
      d: 8,
      e: 9,
      g: 10,
      b: {
        c: 7
      }
    };

    const second = {
      a: 6,
      e: 8,
      g: 10,
      b: {
        c: 8
      }
    };

    const expected = {
      a: {
        newVal: 5,
        oldVal: 6
      },
      b: {
        newVal: {
          c: 7
        },
        oldVal: {
          c: 8
        }
      },
      d: {
        newVal: 8,
        oldVal: undefined
      }
    };

    const exlude = ['e'];
    const actual = diffBetweenObjects(first, second, exlude);
    expect(expected).to.deep.equal(actual);
  });
});
