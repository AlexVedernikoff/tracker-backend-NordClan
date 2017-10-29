const _ = require('underscore');

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
const PARTICIPANT = 'PARTICIPANT';
const MANAGER = 'MANAGER';


module.exports = function (user) {

  class ProjectAccess {
    constructor (projectId) {
      //this.user = user;
      this.projectId = projectId;
      this.role = null;
      this.isParticipant = false;
      this.isManager = false;
      this.setRole();
    }


    can () {
      // req.user.can = (resource, action, projectId) => {
      //   const grants = _.find(req.user.projects, (obj) => {
      //     console.log(obj.dataValues.projectId );
      //     return obj.dataValues.projectId === projectId;
      //   });
      //   console.log(grants);
      //   return grants;
      // };
    }




    // noinspection JSAnnotator
    setRole () {
      const isMyProject = Boolean(_.find(user.myProjects, (obj) => obj.dataValues.projectId === this.projectId));
      if (isMyProject) {
        this.role = MANAGER;
        this.isManager = true;
        this.isParticipant = true;
        return;
      }


      const poject = _.find(this.myProjects, (obj) => obj.projectId === this.projectId);
      if(!poject) {
        this.isParticipant = true;
        

      }


      this.role = NO_ACCESS;
      this.isManager = false;
      this.isParticipant = false;
      return;
    };


  }

  // const myProjects = req.user.myProjects.map(o => o.dataValues);
  // const projects = req.user.projects.map(o => o.dataValues);
  return projectId => new ProjectAccess(projectId);

};