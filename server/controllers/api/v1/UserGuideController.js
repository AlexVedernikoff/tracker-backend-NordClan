const createError = require('http-errors');
const models = require('../../../models');
const { UserGuide } = models;

exports.read = async function (req, res, next) {
  try {
    const userGuides = await UserGuide.findByPrimary(req.user.id);

    if (!userGuides) {
      const createdData = await UserGuide.create({ userId: req.user.id });
      res.json(createdData);
    }

    res.json(userGuides);
  } catch (e) {
    return next(createError(e));
  }
};

const isValidGuideName = (body) => {
  return body.guide &&
    ['isOffTimeGuideCompleted', 'isVacationGuideCompleted', 'isSickLeaveGuideCompleted'].includes(body.guide)
}

exports.setGuideStatus = async function (req, res, next) {
  let transaction;

  if (!isValidGuideName(req.body)) {
    return next(createError(400), 'Invalid settable guide name');
  }

  try {
    transaction = await models.sequelize.transaction();
    const model = await UserGuide.findByPrimary(req.user.id, { transaction, lock: 'UPDATE' });

    if (!model) {
      await transaction.rollback();
      return next(createError(404));
    }

    const updated = { [req.body.guide]: true };

    if (model.dataValues.isGuideModalShown) {
      const updatedModel = {
        ...model.dataValues,
        ...updated
      }

      updated.isGuideModalShown = !(
        updatedModel.isSickLeaveGuideCompleted
        && updatedModel.isVacationGuideCompleted
        && updatedModel.isOffTimeGuideCompleted
      )
    }

    await model.updateAttributes(updated, { transaction });
    await transaction.commit();

    const userGuides = await UserGuide.findByPrimary(req.user.id);

    res.json(userGuides);
  } catch (e) {
    return next(createError(e));
  }
};

exports.resetIsGuideModalShown = async function (req, res, next) {
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    let model = await UserGuide.findByPrimary(req.user.id, { transaction, lock: 'UPDATE' });

    if (!model) {
      model = await UserGuide.create({ userId: req.user.id });
    }

    await model.updateAttributes({ isGuideModalShown: false }, { transaction });
    await transaction.commit();

    const userGuides = await UserGuide.findByPrimary(req.user.id);

    res.json(userGuides);
  } catch (e) {
    return next(createError(e));
  }
};