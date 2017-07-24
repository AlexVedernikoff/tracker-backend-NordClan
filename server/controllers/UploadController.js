const createError = require('http-errors');
const formidable = require('formidable');
const gm = require('gm');
const fs = require('fs');
const models = require('../models');
const queries = require('../models/queries');
const stringHelper = require('../components/StringHelper');

const maxFieldsSize = 1024 * 1024 * 1024; // 1gb
const maxFields = 1;

exports.delete = function(req, res, next) {
  req.sanitize('entity').trim();
  req.sanitize('id').trim();
  req.checkParams('entity', 'entity must be \'task\' or \'project\'' ).isIn(['task',  'project']);
  req.checkParams('entityId', 'entityId must be int').isInt();
  req.checkParams('attachmentId', 'entityId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if(!validationResult.isEmpty()) return next(createError(400, validationResult));
      
      const modelName = stringHelper.firstLetterUp(req.params.entity);
      const modelFileName = modelName + 'Attachments';
      
      
      models[modelFileName].destroy({
        where: {
          id: req.params.attachmentId
        }
      })
        .then(()=>{
          return queries.file.getFilesByModel(modelFileName, req.params.entityId)
            .then((files) => {
              res.end(JSON.stringify(files));
            });
        })
        .catch((err) => next(createError(err)));
  
      
      
    });

};

exports.upload = function(req, res, next) {
  req.sanitize('entity').trim();
  req.sanitize('entityId').trim();
  req.checkParams('entity', 'entity must be \'task\' or \'project\'' ).isIn(['task',  'project']);
  req.checkParams('entityId', 'entityId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if(!validationResult.isEmpty()) return next(createError(400, validationResult));
      
      const modelName = stringHelper.firstLetterUp(req.params.entity);
      const modelFileName = modelName + 'Attachments';
      let uploadDir =  '/uploads/' + req.params.entity + 'sAttachments/';
      
      
      models[modelName]
        .findByPrimary(req.params.entityId, {
          attributes: ['id']
        })
        .then((model)=>{
          if(!model) return next(createError(404, 'Entity model not found'));
          
          const form = new formidable.IncomingForm();
          form.maxFieldsSize = maxFieldsSize;
          form.maxFields = maxFields;
          let file;
          let filePath;
          let previewPromise;
          let previewPath = null;
          
          form.parse(req, function(err) {
            if(err) throw createError(err);
          });
          
          form
            .on('fileBegin', (name, file) => {
              uploadDir = getDir(uploadDir, model.id);
              filePath = uploadDir + '/' + file.name;
              file.path = './public/' + filePath;
            })
            .on('file', (name, f) => {
              file = f;
            })
            .on('end', () => {
              
              if(file) {
                // Превью у картинки
                if(['image/jpeg', 'image/png', 'image/pjpeg'].indexOf(file.type) !== -1) {
                  previewPromise = new Promise(function (resolve, reject) {
                    gm('./public/' + filePath)
                      .size({}, function (err, size) {
                        if (err) throw new Error('GraphicsMagick error');
                        if (!err && size.width) {
                          if (size.width >= size.height) {
                            this.resize(null, 200);
                          } else if (size.width < size.height) {
                            this.resize(200, null);
                          }
                        }
                        let preview = uploadDir + '/200-' + file.name;
                        this.write('./public/' + preview, function (err) {
                          if (err) reject(err);
                          previewPath = preview;
                          resolve();
                        });
                      });
                  });
                } else {
                  previewPromise = Promise.resolve();
                }
  
                previewPromise
                  .then(()=>{
                    return models[modelFileName]
                      .create({
                        taskId: req.params.entityId,
                        projectId: req.params.entityId,
                        authorId: req.user.id,
                        fileName: file.name,
                        type: file.type.match(/^(.*)\//)[1],
                        size: file.size,
                        path: filePath,
                        previewPath: previewPath,
                      })
                      .then(() => {
                        return queries.file.getFilesByModel(modelFileName, req.params.entityId)
                          .then((files) => {
                            res.end(JSON.stringify(files));
                          });
                      });
                  })
                  .catch((err) => next(createError(err)));
              } else {
                res.end();
              }
              
            })
            .on('error', function(err) {
              next(err);
            });
          
        })
        .catch((err) => next(createError(err)));
    });
  
};


function getDir(uploadDir, modelId) {
  const randChar = classicRandom(3);
  let path =  uploadDir + modelId;
  createDirIfNotExist('/public' + path);
  path += '/' + randChar;
  createDirIfNotExist('/public' + path);
  
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
