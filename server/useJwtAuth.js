const checkTokenMiddleWare = require('./middlewares/CheckTokenMiddleWare').checkToken;
const checkSystemTokenMiddleWare = require('./middlewares/CheckSystemTokenMiddleWare').checkToken;
const Access = require('./middlewares/Access/SetUserAccessMiddleWare');

exports.useJwtAuth = function (app) {
  app.use(checkTokenMiddleWare);
  app.use(checkSystemTokenMiddleWare);
  app.use(Access.middleware);
};
