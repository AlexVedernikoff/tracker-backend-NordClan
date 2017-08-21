const createError = require('http-errors');
const formidable = require('formidable');
const gm = require('gm');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const models = require('../models');
const queries = require('../models/queries');
const stringHelper = require('../components/StringHelper');

const maxFieldsSize = 1024 * 1024 * 1024; // 1gb
const maxFields = 10;

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

      models[modelFileName]
        .findByPrimary(req.params.attachmentId)
        .then(model => {
          if(model) return model.destroy();
        })
        .then(()=>{
          return queries.file.getFilesByModel(modelFileName, req.params.entityId);
        })
        .then((files) => {
          res.json(files);
        })
        .catch((err) => next(createError(err)));
    });

};

exports.upload = function(req, res, next) {
  req.sanitize('entity').trim();
  req.sanitize('entityId').trim();
  req.checkParams('entity', 'entity must be \'task\' or \'project\'').isIn(['task', 'project']);
  req.checkParams('entityId', 'entityId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));

      const modelName = stringHelper.firstLetterUp(req.params.entity);
      const modelFileName = modelName + 'Attachments';


      models[modelName]
        .findByPrimary(req.params.entityId, {
          attributes: ['id', 'statusId']
        })
        .then((model) => {
          if (!model) return next(createError(404, 'Entity model not found'));
          if (model.statusId === models.TaskStatusesDictionary.CLOSED_STATUS && req.params.entity === 'task') return next(createError(400, 'Task is closed'));

          const uploadDir = '/uploads/' + req.params.entity + 'sAttachments/' + model.id + '/' +  classicRandom(3);
          const absoluteUploadDir = path.join(__dirname, '../../public/' + uploadDir);

          mkdirp(absoluteUploadDir, (err) => {
            if (err) return createError(err);

            const form = new formidable.IncomingForm();
            form.multiples = true;
            form.maxFieldsSize = maxFieldsSize;
            form.maxFields = maxFields;
            form.uploadDir = absoluteUploadDir;

            form.on('error', function (err) {
              next(err);
            });

            form.on('end', function (err) {
              if (err) return next(createError(err));
              queries.file.getFilesByModel(modelFileName, req.params.entityId)
                .then((files) => {
                  res.json(files);
                })
                .catch((err) => next(createError(err)));
            });

            form.on('file', function (field, file) {
              let newPath = path.join(form.uploadDir, file.name);
              return fs.rename(file.path, newPath, () => {

                let promise = Promise.resolve();

                if (['image/jpeg', 'image/png', 'image/pjpeg'].indexOf(file.type) !== -1) {
                  promise = cropImage(file, uploadDir, newPath);
                }

                return promise.then((previewPath) => {
                  return models[modelFileName]
                    .create({
                      taskId: req.params.entityId,
                      projectId: req.params.entityId,
                      authorId: req.user.id,
                      fileName: file.name,
                      type: file.type.match(/^(.*)\//)[1],
                      size: file.size,
                      path: uploadDir + '/' + file.name,
                      previewPath: previewPath ? previewPath : null,
                    });
                })
                  .catch((err) => next(createError(err)));

              });
            });

            form.parse(req, function (err) {
              if (err) throw createError(err);
            });

          });

        });

    });
};

function classicRandom(n){
  let result ='', abd ='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', aL = abd.length;
  while(result.length < n)
    result += abd[Math.random() * aL|0];

  return result;
}

function cropImage(file, uploadDir, newPath) {
  return new Promise(function (resolve, reject) {
    gm(newPath)
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
          resolve(preview);
        });
      });
  });
}