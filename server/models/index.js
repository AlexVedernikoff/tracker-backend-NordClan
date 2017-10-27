const createError = require('http-errors');
const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../orm');
const historyHook = require('../components/historyHook');
historyHook(sequelize);

const db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'queries');
  })
  .forEach(function(file) {
    let model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
    db[model.name].checkAttributes = checkAttributes.bind(db[model.name]);
  });


Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;


function checkAttributes(attribures) {
  if(!Array.isArray(attribures)) attribures = [attribures];
  attribures.forEach((el) => {
    if(!(el in this.rawAttributes)) throw createError(400, 'Attribute "' + el + '" not found');
  });
}
