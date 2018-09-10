/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const mocha = require('mocha');
const expect = chai.expect;
const { getMentions } = require('./../../../server/services/comment');
const describe = mocha.describe;
const it = mocha.it;

describe('Parse user ids', () => {
  it('should return ids by comment with ids', () => {
    expect(getMentions('test {@1} test {@2}')).deep.eql([1, 2]);
  });

  it('should return empty array by comment with no ids', () => {
    expect(getMentions('test test')).deep.eql([]);
  });
});
