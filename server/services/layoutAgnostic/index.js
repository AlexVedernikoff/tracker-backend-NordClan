const ru = require('convert-layout/ru');
const enRe = /[a-zA-Z]/;

module.exports = (request) => {
  return { $any: [`%${request}%`, `%${enRe.test(request) ? ru.fromEn(request) : ru.toEn(request)}%`] };
};
