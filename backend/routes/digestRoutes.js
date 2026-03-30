const express = require('express');
const userController = require('../controllers/userController');
const digestController = require('../controllers/digestController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

router.use(userController.getCurrentUser);

router
  .route('/')
  .get(digestController.getDigests);

router
  .route('/:digestId')
  .delete(digestController.deleteDigest);

router
  .route('/content')
  .post(sanitizeRequestBody, digestController.createDigestFromContent);

router
  .route('/:digestId/content')
  .get(digestController.getDigestContents)
  .post(sanitizeRequestBody, digestController.createDigestContentItem);

router
  .route('/:digestId/content/reorder')
  .put(sanitizeRequestBody, digestController.reorderDigestContents);

router
  .route('/:digestId/content/:contentId')
  .put(sanitizeRequestBody, digestController.updateDigestContentItem)
  .delete(digestController.deleteDigestContentItem);

router
  .route('/:digestId/timings')
  .get(digestController.getDigestTimings)
  .post(sanitizeRequestBody, digestController.createDigestTiming);

router
  .route('/:digestId/timings/:timingId/schedule')
  .put(sanitizeRequestBody, digestController.updateDigestTimingSchedule);

router
  .route('/:digestId/timings/:timingId/targets')
  .get(digestController.getDigestTimingTargets)
  .put(sanitizeRequestBody, digestController.updateDigestTimingTargets);

module.exports = router;

