const models = require('../models/index');
const { statuses } = require('../middlewares/Access/userAuthExtension');
const createError = require('http-errors');
const User = models.User;
const Task = models.Task;

exports.checkCertMiddleware = function (req, res, next) {
  const cert = req.socket.getPeerCertificate();

  if (req.client.authorized && !req.user) {
    User.findOne({
      where: {
        login: cert.subject.CN,
        active: 1,
      },
    })
      .then(user => {
        if (user) {
          if (user.dataValues.globalRole === statuses.DEV_OPS) {
            return Task.findAll({
              attributes: ['projectId'],
              where: {
                isDevOps: true,
              },
            }).then((tasks) => {
              if (tasks !== 0) {
                user.devOpsProjects = tasks.map(task => task.projectId);
              }
              return user;
            });
          } else {
            return user;
          }
        } else {
          return user;
        }
      })
      .then(user => {
        if (!user) {
          return next(createError(401, 'No found user or access in the system. Or access token has expired'));
        }

        if (user.dataValues.department && user.dataValues.department[0]) {
          user.dataValues.department = user.dataValues.department[0].name;
        }

        req.user = user;

        return next();
      })
      .catch(err => next(err));
  } else if (cert.subject) {
    res.status(403)
      .send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`);
  } else {
    res.status(401)
      .send('Sorry, but you need to provide a client certificate to continue.');
  }
};
