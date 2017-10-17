const createError = require('http-errors');
const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../configs/index');
const tokenSecret = 'token_s';
const tokenSecretSystem = 'wywirec.';

exports.checkToken = function (req, res, next) {
  let token, decoded, authorization;

  if (/\/auth\/login$/ui.test(req.url)){//potential defect /blabla/auth/login - is not validated
    return next();
  }

  if (!isSystemUser(req)) {
    return next();
  }


  try {
    authorization = req.cookies['system-authorization'] ? req.cookies['system-authorization'] : req.headers['system-authorization'];

    token = authorization.split(' ')[1];
    decoded = jwt.decode(token, tokenSecret);
    req.token = token;
    req.decoded = decoded;
  } catch (err) {
    return next(createError(403, 'Can not parse access token - it is not valid'));
  }


  req.user = user;
};

exports.createSystemJwtToken = function () {
  const expires = moment().add(config.systemAuth.accessTokenLifetime, 's');
  return {token: jwt.encode(expires, tokenSecretSystem, 'HS512'), expires: expires};
};


function isSystemUser(req) {
  return (req.headers['system-authorization'] || req.cookies['system-authorization']);
}
