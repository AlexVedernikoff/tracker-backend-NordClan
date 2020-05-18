const createError = require('http-errors');
const formidable = require('formidable');
const gm = require('gm');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const { imagesSalt } = require('../../../configs');
const models = require('../../../models');
const queries = require('../../../models/queries');
const stringHelper = require('../../../components/StringHelper');
const { unlink } = require('../../../services/comment');

const maxFieldsSize = 1024 * 1024 * 1024; // 1gb
const maxFields = 10;

exports.deleteAvatar = async function (req, res, next) {
  if (!req.params.id) return createError(422, 'User is required');

  const id = parseInt(req.params.id, 10);
  const isSelfEdit = id === req.user.dataValues.id;
  const isAdminEditing = id !== req.user.dataValues.id && req.user.dataValues.globalRole === 'ADMIN';
  if (!isSelfEdit && !isAdminEditing) return createError(403, 'Access denied');

  const userToEdit = await models.User.find({ where: { id } });
  if (!userToEdit) return createError(422, 'Invalid user');

  const fileNameHash = genHashName(userToEdit.dataValues.id);
  const absoluteUploadDir = path.dirname(require.main.filename) + '/public/avatars';
  const filePath = `${absoluteUploadDir}/${fileNameHash}.jpg`;

  fs.unlink(filePath, function (error) {
    if (error) return next(createError(error));
    res.status(200).send('OK');
  });
};

exports.uploadAvatar = async function (req, res, next) {
  if (!req.params.id) return createError(422, 'User is required');

  const id = parseInt(req.params.id, 10);
  const isSelfEdit = id === req.user.dataValues.id;
  const isAdminEditing = id !== req.user.dataValues.id && req.user.dataValues.globalRole === 'ADMIN';
  if (!isSelfEdit && !isAdminEditing) return createError(403, 'Access denied');

  const userToEdit = await models.User.find({ where: { id } });
  if (!userToEdit) return createError(422, 'Invalid user');

  const fileNameHash = genHashName(userToEdit.dataValues.id);
  const absoluteUploadDir = path.dirname(require.main.filename) + '/public/avatars';
  const absoluteFilePath = `${absoluteUploadDir}/${fileNameHash}.jpg`;
  const relativeFilePath = `/avatars/${fileNameHash}.jpg`;

  mkdirp(absoluteUploadDir, (err) => {
    if (err) return createError(err);
    const form = new formidable.IncomingForm();
    form.multiples = false;
    form.maxFieldsSize = 20 * 1024 * 1024; //20mb
    form.uploadDir = absoluteUploadDir;
    const files = [];

    form.on('end', function (error) {
      if (error) return next(createError(error));
      const [file] = files;

      const SIZE = 200;
      return cropSquareImage(file, SIZE)
        .then(cropError => {
          if (cropError) return next(createError(cropError));
          fs.rename(file.path, absoluteFilePath, () => res.json({ photo: relativeFilePath }));
        })
        .catch(cropError => {
          fs.unlink(file.path, function () {
            return next(createError(cropError));
          });
        });
    });

    // Загружен 1 файл
    form.on('file', function (field, file) {
      files.push(file);
    });

    form.parse(req, function (e) {
      if (e) return next(createError(e));
    });
  });
};


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
                const dotIndex = file.name.lastIndexOf('.');
                const nameWithTimestamp = `${file.name.slice(0, dotIndex)}-${Date.now()}${file.name.slice(dotIndex)}`;
                const newPath = path.join(form.uploadDir, nameWithTimestamp);
                // Переименование
                return new Promise((resolve) => {
                  fs.rename(file.path, newPath, resolve);
                }) //Подрезка если изображение
                  .then(() => {
                    if (['image/jpeg', 'image/png', 'image/pjpeg'].indexOf(file.type) !== -1) return cropImage(file, uploadDir, newPath, nameWithTimestamp);
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
                        path: uploadDir + '/' + nameWithTimestamp,
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

function genHashName (name) {
  const hashedName = name + imagesSalt;
  return crypto.createHash('md5').update(hashedName).digest('hex');
}

function classicRandom (n){
  let result = '';
  const abd = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const aL = abd.length;
  while (result.length < n) {
    result += abd[Math.random() * aL | 0];
  }
  return result;
}

function cropSquareImage (file, sideSize) {
  return new Promise((resolve, reject) => {
    gm(file.path)
      .noProfile()
      .size({}, function (error, size) {
        if (error) return reject(error);
        const isVertical = size.width < size.height;
        const isHorizontal = size.width > size.height;
        const isWithCrop = isVertical || isHorizontal;

        const resizeArgs = isVertical
          ? [sideSize, null]
          : isHorizontal
            ? [null, sideSize]
            : [sideSize, sideSize];

        let cropArgs = [];
        if (isWithCrop) {
          const widthAfterResize = isVertical ? sideSize : (size.width / size.height * sideSize);
          const heightAfterResize = isHorizontal ? sideSize : (size.height / size.width * sideSize);
          const x = isVertical ? 0 : (widthAfterResize - sideSize) / 2;
          const y = isHorizontal ? 0 : (heightAfterResize - sideSize) / 2;
          cropArgs = [sideSize, sideSize, Math.round(x), Math.round(y)];
        }

        return (
          isWithCrop
            ? this.resize(...resizeArgs).crop(...cropArgs)
            : this.resize(...resizeArgs)
        )
          .write(file.path, function (writeError) {
            if (writeError) return reject(writeError);
            resolve();
          });
      });
  });
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
