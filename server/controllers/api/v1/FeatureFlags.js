const { featureFlags } = require('../../../configs/index');

/**
 * @typedef { import('express').Request } Request
 * @typedef { import('express').Response } Response
 */

/**
 * Возвращает фича-флаги
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
exports.get = async (req, res) => {
  res.json(featureFlags);
};

/**
 * Задает значение фича-флагу
 * @param {Request} req
 * @param {Response} res
 * @todo tree checking before value set
 * @returns {Promise<void>}
 */
exports.set = async (req, res) => {
  try {
    const { path, value } = req.body;

    const pathSiblings = path.split('.');
    const featureFlagTree = pathSiblings.reverse().reduce((acc, cur) => ({ [cur]: acc }), value);

    // TODO: tree checking before value set
    featureFlags.root = ({ ...featureFlags.root, ...featureFlagTree });
    res.json({ changed: true });
  } catch (e) {
    console.error(`ERROR: FeatureFlags: Set Flag: ${e}`);
    res.json({ changed: false, reason: e.toString() });
  }
};
