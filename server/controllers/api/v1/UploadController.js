const createError = require('http-errors');
const formidable = require('formidable');
const gm = require('gm');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const models = require('../../../models');
const queries = require('../../../models/queries');
const stringHelper = require('../../../components/StringHelper');
const { unlink } = require('../../../services/comment');

const maxFieldsSize = 1024 * 1024 * 1024; // 1gb
const maxFields = 10;

exports.delete = async function (req, res, next) {
  req.sanitize('entity').trim();
  req.sanitize('id').trim();
  req.checkParams('entity', 'entity must be \'task\' or \'project\'').isIn(['task', 'project']);
  req.checkParams('entityId', 'entityId must be int').isInt();
  req.checkParams('attachmentId', 'entityId must be int').isInt();
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) return next(createError(400, validationResult));

  const modelName = stringHelper.firstLetterUp(req.params.entity);
  const modelFileName = modelName + 'Attachments';
  models[modelFileName]
    .findByPrimary(req.params.attachmentId, {
      attributes: req.params.entity === 'project' ? ['id', 'projectId'] : ['id', 'taskId'],
      include: req.params.entity === 'task'
        ? [
          {
            as: 'task',
            model: models.Task,
            attributes: ['projectId']
          }
        ]
        : []
    })
    .then(model => {
      if (!model) {
        return next(createError(404));
      }

      if (req.params.entity === 'task' && !(req.user.isUserOfProject(model.task.projectId) || req.user.isGlobalAdmin)) {
        return next(createError(403, 'Access denied'));
      }

      if (req.params.entity === 'project' && !req.user.canUpdateProject(model.projectId)) {
        return next(createError(403, 'Access denied'));
      }
      if (model) return model.destroy({ historyAuthorId: req.user.id });
    })
    .then(() => {
      return req.params.entity === 'task' ? unlink(req.params.entityId, req.params.attachmentId, next) : null;
    })
    .then(()=>{
      return queries.file.getFilesByModel(modelFileName, req.params.entityId);
    })
    .then((files) => {
      res.json(files);
    })
    .catch((err) => next(createError(err)));
};


exports.upload = function (req, res, next) {
  req.sanitize('entity').trim();
  req.sanitize('entityId').trim();
  req.checkParams('entity', 'entity must be \'task\' or \'project\'').isIn(['task', 'project']);
  req.checkParams('entityId', 'entityId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));

      if (req.params.entity === 'project' && !req.user.canUpdateProject(req.params.entityId)) {
        return next(createError(403, 'Access denied'));
      }

      const modelName = stringHelper.firstLetterUp(req.params.entity);
      const modelFileName = modelName + 'Attachments';


      return models[modelName]
        .findByPrimary(req.params.entityId, {
          attributes: req.params.entity === 'project' ? ['id', 'statusId'] : ['id', 'statusId', 'projectId']
        })
        .then((model) => {
          if (!model) {
            return next(createError(404, 'Entity model not found'));
          }
          if (model.statusId === models.TaskStatusesDictionary.CLOSED_STATUS && req.params.entity === 'task') {
            return next(createError(400, 'Task is closed'));
          }
          if (req.params.entity === 'task' && !(req.user.isUserOfProject(model.projectId) || req.user.isGlobalAdmin)) {
            return next(createError(403, 'Access denied'));
          }

          const appDir = path.dirname(require.main.filename);
          const uploadDir = 'uploads/' + req.params.entity + 'sAttachments/' + model.id + '/' + classicRandom(3);
          const absoluteUploadDir = appDir + '/public/' + uploadDir;
          const files = [];

          mkdirp(absoluteUploadDir, (err) => {
            if (err) return createError(err);

            const form = new formidable.IncomingForm();
            form.multiples = true;
            form.maxFieldsSize = maxFieldsSize;
            form.maxFields = maxFields;
            form.uploadDir = absoluteUploadDir;

            form.on('error', function (e) {
              next(e);
            });

            form.on('aborted', function () {
              res.end();
            });

            // Все файлы загружены
            form.on('end', function (error) {
              if (error) return next(createError(error));

              const promises = files.map((file) => {
                const hash = `${classicRandom(8)}-${classicRandom(8)}-${Date.now()}${file.name.slice(file.name.lastIndexOf('.'))}`;
                const newPath = path.join(form.uploadDir, hash);
                // Переименование
                return new Promise((resolve) => {
                  fs.rename(file.path, newPath, resolve);
                }) //Подрезка если изображение
                  .then(() => {
                    if (['image/jpeg', 'image/png', 'image/pjpeg'].indexOf(file.type) !== -1) return cropImage(file, uploadDir, newPath, hash);
                  })
                  .then((previewPath) => {
                  // Сохранение в БД

                    return models[modelFileName]
                      .create({
                        taskId: req.params.entityId,
                        projectId: req.params.entityId,
                        authorId: req.user.id,
                        fileName: file.name,
                        type: file.type,
                        size: file.size,
                        path: uploadDir + '/' + hash,
                        previewPath: previewPath ? previewPath : null
                      });
                  });
              });


              return Promise.all(promises)
                .then(() => {
                  return queries.file.getFilesByModel(modelFileName, req.params.entityId)
                    .then((uploadFiles) => {
                      res.json(uploadFiles);
                    });
                })
                .catch((e) => next(e));
            });

            // Загружен 1 файл
            form.on('file', function (field, file) {
              files.push(file);
            });

            form.parse(req, function (e) {
              if (e) return next(createError(e));
            });

          });

        })
        .catch((err) => next(err));

    });
};

function classicRandom (n){
  let result = '';
  const abd = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const aL = abd.length;
  while (result.length < n) {
    result += abd[Math.random() * aL | 0];
  }
  return result;
}

function cropImage (file, uploadDir, newPath, hash) {
  return new Promise(function (resolve, reject) {
    gm(newPath)
      .size({}, function (err, size) {
        if (err) return reject(err);
        if (size.width) {
          if (size.width >= size.height) {
            this.resize(null, 200);
          } else {
            this.resize(200, null);
          }
        }
        const preview = uploadDir + '/200-' + hash;
        this.write('./public/' + preview, function (error) {
          if (error) return reject(error);
          resolve(preview);
        });
      });
  });
}
