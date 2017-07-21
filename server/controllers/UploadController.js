const createError = require('http-errors');
const models = require('../models');
const fs = require('fs');
const stringHelper = require('../components/StringHelper');
const formidable = require('formidable');

const uploadPath = '/public/uploads/projectsFiles/';
const maxFieldsSize = 1024 * 1024 * 1024; // 1gb
const maxFields = 1;

exports.upload = function(req, res, next) {
  
  req.sanitize('entity').trim();
  req.sanitize('id').trim();
  req.checkParams('entity', 'entity must be \'task\' or \'project\'' ).isIn(['task',  'project']);
  req.checkParams('id', 'entityId must be int').isInt();
  req
    .getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) return next(createError(400, result));
      const modelName = stringHelper.firstLetterUp(req.params.entity);
      const modelFileName = modelName + 'Files';
      
      
      models[modelName]
        .findByPrimary(req.params.id, {
          attributes: ['id']
        })
        .then((model)=>{
          if(!model) return next(createError(404, 'Entity model not found'));

        
          const form = new formidable.IncomingForm();
          form.maxFieldsSize = maxFieldsSize;
          form.maxFields = maxFields;
          let file;
          let filePath;
          
          form.parse(req);
          
          form
            .on('fileBegin', (name, file) => {
              filePath = getDir(model.id) + '/' + file.name;
              file.path = '.' + filePath;
            })
            .on('file', (name, f) => {
              file = f;
            })
            .on('end', () => {
              
              // Нужно превью у картинки
              models[modelFileName]
                .create({
                  taskId: req.params.id,
                  projectId: req.params.id,
                  authorId: req.user.id,
                  fileName: file.name,
                  type: file.type.match(/^(.*)\//)[1],
                  size: file.size,
                  path: filePath,
                })
                .then(() => {
                
                  
                
                })
                .catch((err) => next(createError(err)));
              
            })
            .on('progress', function(bytesReceived, bytesExpected) {
              console.log({
                type: 'progress',
                bytesReceived: bytesReceived,
                bytesExpected: bytesExpected
              });
            })
            .on('aborted', function() {
              console.log('aborted');
            })
            .on('error', function(err) {
              next(err);
            });
          
        })
        .catch((err) => next(createError(err)));
      
    });
  
};

function getDir(modelId) {
  const randChar = classicRandom(3);
  
  let path = uploadPath + modelId;
  createDirIfNotExist(path);
  
  path += '/' + randChar;
  createDirIfNotExist(path);
  
  return path;
}

function createDirIfNotExist(dir) {
  if (!fs.existsSync('.' + dir)){
    fs.mkdirSync('.' + dir);
  }
}

function classicRandom(n){
  let result ='', abd ='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', aL = abd.length;
  while(result.length < n)
    result += abd[Math.random() * aL|0];
  return result;
}