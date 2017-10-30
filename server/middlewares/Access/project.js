const _ = require('underscore');
const models = require('../../models/index');

const projectGrants = {
  user: {
    project: {
      'read':  { granted: true, attributes: ['*'] },
      'update':  { granted: true, attributes: ['*'] },
      'delete':  { granted: false, attributes: ['*'] },
    }
  },
};

const NO_ACCESS = 'NO_ACCESS';
const USER_PROJECT = 'USER_PROJECT';
const ADMIN_PROJECT = 'ADMIN_PROJECT';


module.exports = function (user) {

  class ProjectAccess {
    constructor (projectId) {
      //this.user = user;
      this.projectId = projectId;
      this.role = null;
      this.isAdmin = false;
      this.isUser = false;
      this.initRole();
    }


    can () {
      // ...
    }

    initRole () {
      // Проверка на глобальную роль
      if (user.globalRole === 'ADMIN') {
        this.role = ADMIN_PROJECT;
        this.isAdmin = true;
        this.isUser = true;
      }

      // Автор проекта
      const isMyProject = Boolean(_.find(user.createdProjects, (obj) => obj.id === this.projectId));
      if (isMyProject) {
        this.role = ADMIN_PROJECT;
        this.isAdmin = true;
        this.isUser = true;
        return;
      }


      const poject = _.find(user.userProjects, (obj) => obj.projectId === this.projectId);
      if(poject) {
        // PM, AM проекта
        const roles = JSON.parse(poject.rolesIds);
        if (contains(roles, models.ProjectRolesDictionary.ADMIN_IDS)) {
          this.role = ADMIN_PROJECT;
          this.isAdmin = true;
          this.isUser = true;
          return;
        }

        // Просто пользователь проекта
        this.role = USER_PROJECT;
        this.isAdmin = false;
        this.isUser = true;
        return;
      }

      // Нет доступа к проекту
      this.role = NO_ACCESS;
      this.isManager = false;
      this.isParticipant = false;
      return;
    }
  }

  return projectId => new ProjectAccess(projectId);
};

function contains(where, what){
  for(let i=0; i < what.length; i++){
    if(where.indexOf(what[i]) !== -1) return true;
  }
  return false;
}