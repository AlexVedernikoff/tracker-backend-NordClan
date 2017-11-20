const chai = require('chai');
const expect = chai.expect;
const { userAuthExtension } = require('./../../server/middlewares/Access/userAuthExtension');
const { statuses } = require('./../../server/middlewares/Access/userAuthExtension');

describe('Auth Extension', () => {
  it('should return system user', () => {
    const user = {};
    const isSystemUser = true;
    const extensibleUser = userAuthExtension(user, isSystemUser);
    const expected = {
      dataValues: {
        authorsProjects: [],
        usersProjects: []
      },
      globalRole: statuses.SYSTEM_USER
    };

    expect(expected).to.deep.equal(extensibleUser);
  });

  it('should add methods for admin', () => {
    const user = {
      dataValues: {
        authorsProjects: [
          {
            dataValues: {
              id: 1
            }
          }
        ],
        usersProjects: [
          {
            dataValues: {
              id: 1,
              rolesIds: '[1,2]'
            }
          }
        ]
      },
      globalRole: statuses.ADMIN
    };

    const extensibleUser = userAuthExtension(user);
    expect(extensibleUser.isGlobalAdmin).to.be.true;
    expect(extensibleUser.isVisor).to.be.false;
    expect(extensibleUser.isAdminOfProject(1)).to.be.true;
    expect(extensibleUser.isUserOfProject(1)).to.be.true;
    expect(extensibleUser.canReadProject(1)).to.be.true;
    expect(extensibleUser.canUpdateProject(1)).to.be.true;
    expect(extensibleUser.canCreateCommentProject(1)).to.be.true;
    expect(extensibleUser.canUpdateCommentProject(1)).to.be.true;
  });

  it('should add access for project creator', () => {
    const user = {
      dataValues: {
        authorsProjects: [
          {
            dataValues: {
              id: 1
            }
          }
        ],
        usersProjects: [
          {
            dataValues: {
              id: 1,
              rolesIds: '[1,2]'
            }
          }
        ]
      },
      globalRole: statuses.USER
    };

    const extensibleUser = userAuthExtension(user);
    expect(extensibleUser.isGlobalAdmin).to.be.false;
    expect(extensibleUser.isVisor).to.be.false;
    expect(extensibleUser.isAdminOfProject(1)).to.be.true;
    expect(extensibleUser.isUserOfProject(1)).to.be.true;
    expect(extensibleUser.canReadProject(1)).to.be.true;
    expect(extensibleUser.canUpdateProject(1)).to.be.true;
    expect(extensibleUser.canCreateCommentProject(1)).to.be.true;
    expect(extensibleUser.canUpdateCommentProject(1)).to.be.true;
  });

  it('should not add access for common user', () => {
    const user = {
      dataValues: {
        authorsProjects: [],
        usersProjects: []
      },
      globalRole: statuses.USER
    };

    const extensibleUser = userAuthExtension(user);
    expect(extensibleUser.isGlobalAdmin).to.be.false;
    expect(extensibleUser.isVisor).to.be.false;
    expect(extensibleUser.isAdminOfProject(1)).to.be.false;
    expect(extensibleUser.isUserOfProject(1)).to.be.false;
    expect(extensibleUser.canReadProject(1)).to.be.false;
    expect(extensibleUser.canUpdateProject(1)).to.be.false;
    expect(extensibleUser.canCreateCommentProject(1)).to.be.false;
    expect(extensibleUser.canUpdateCommentProject(1)).to.be.false;
  });
});
