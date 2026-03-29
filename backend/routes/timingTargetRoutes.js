const express = require('express');
const targetController = require('../controllers/targetController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(targetController.getTargetsForTiming)
  .post(sanitizeRequestBody, targetController.linkTargetToTiming);

router
  .route('/:targetId')
  .get(targetController.getTargetForTiming)
  .put(sanitizeRequestBody, targetController.updateTargetForTiming)
  .delete(targetController.unlinkTargetFromTiming);

module.exports = router;
