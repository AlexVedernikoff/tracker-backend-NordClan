const createError = require('http-errors');
const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../configs/index');
const SystemToken = require('../models/index').SystemToken;
const tokenSecretSystem = 'wywirec.';

exports.checkToken = function (req, res, next) {
  let systemToken, decoded, authorization;
  req.systemUser = false;

  if (/\/auth\/login$/ui.test(req.url)){//potential defect /blabla/auth/login - is not validated
    return next();
  }

  if (isNotSystemUser(req)) {
    return next();
  }

  try {
    authorization = req.cookies['system-authorization'] ? req.cookies['system-authorization'] : req.headers['system-authorization'];

    systemToken = authorization.split(' ')[1];
    decoded = jwt.decode(systemToken, tokenSecretSystem);
    req.systemToken = systemToken;
    req.decoded = decoded;
  } catch (err) {
    return next(createError(403, 'Can not parse access system token - it is not valid'));
  }

  SystemToken
    .findOne({
      where: {
        token: req.systemToken
      }
    })
    .then((row) => {
      if(!row) throw createError(404, 'No found system access token or access token has expired');

      req.systemUser = true;
      return next();
    })
    .catch((err) => next(createError(err)));

};

exports.createJwtToken = function () {
  const expires = moment().add(config.systemAuth.accessTokenLifetime, 's');
  return {token: jwt.encode(expires, tokenSecretSystem, 'HS512'), expires: expires};
};


function isNotSystemUser(req) {
  return !(req.headers['system-authorization'] || req.cookies['system-authorization']);
}
