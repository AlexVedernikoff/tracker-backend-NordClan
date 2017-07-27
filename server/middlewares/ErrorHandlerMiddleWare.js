const statuses = require('statuses');
const Sequelize = require('sequelize');
const ldap = require('ldapjs');
const production = process.env.NODE_ENV === 'production';

module.exports = function(err, req, res, next) {
  
  if (err.mapped) { // expressValidator
    err.status = 400;
    err.name = 'ValidationError';
    err.message = {errors: err.array()};
  }
  
  if(err instanceof ldap.InvalidCredentialsError) {
    err.status = 404;
  }
  
  if(err instanceof Sequelize.ForeignKeyConstraintError) {
    err.status = 400;
  }
  
  // if(err instanceof Sequelize.Error) {
  //   err.status = 400;
  // }
  
  if(err instanceof Sequelize.ValidationError) {
    err.status = 400;
    err.name = 'ValidationError';
    err.message = err.errors.map((el) => { return el.path + ' ( ' + el.message + ')'; }).join('. ');
  }
  
  sendError(res, err);
};


function sendError(res, err) {
  let status = err.status || err.statusCode || 500;
  if (status < 400) status = 500;
  res.statusCode = status;
  
  let body = {
    status: status
  };
  
  // show the stacktrace when not in production
  if (!production) body.stack = err.stack;
  
  // internal server errors
  if (status >= 500) {
    console.error(err.stack);
    body.message = statuses[status];
    res.json(body);
    return;
  }
  
  // client errors
  body.message = err.message;
  
  if (err.code) body.code = err.code;
  if (err.name) body.name = err.name;
  if (err.type) body.type = err.type;
  
  res.json(body);
}