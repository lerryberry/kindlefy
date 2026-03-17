const express = require('express');
const userController = require('../controllers/userController');
const deliveryTargetController = require('../controllers/deliveryTargetController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

router.use(userController.getCurrentUser);

router
  .route('/')
  .get(deliveryTargetController.getAllDeliveryTargets)
  .post(sanitizeRequestBody, deliveryTargetController.createDeliveryTarget);

router
  .route('/:id')
  .get(deliveryTargetController.getDeliveryTarget)
  .put(sanitizeRequestBody, deliveryTargetController.updateDeliveryTarget)
  .delete(deliveryTargetController.deleteDeliveryTarget);

module.exports = router;

