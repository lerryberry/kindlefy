const express = require('express');
const userController = require('../controllers/userController');
const timingController = require('../controllers/timingController');
const timingTargetRouter = require('./timingTargetRoutes');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

router.use(userController.getCurrentUser);

router
  .route('/')
  .get(timingController.getAllTimings)
  .post(sanitizeRequestBody, timingController.createTiming);

router.use('/:timingId/targets', timingTargetRouter);

router
  .route('/:id')
  .get(timingController.getTiming)
  .put(sanitizeRequestBody, timingController.updateTiming)
  .delete(timingController.deleteTiming);

module.exports = router;
