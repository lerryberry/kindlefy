const express = require('express');
const userController = require('../controllers/userController');
const deliveryPlanController = require('../controllers/deliveryPlanController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

router.use(userController.getCurrentUser);

router
  .route('/')
  .get(deliveryPlanController.getAllDeliveryPlans)
  .post(sanitizeRequestBody, deliveryPlanController.createDeliveryPlan);

router
  .route('/:id')
  .get(deliveryPlanController.getDeliveryPlan)
  .put(sanitizeRequestBody, deliveryPlanController.updateDeliveryPlan)
  .delete(deliveryPlanController.deleteDeliveryPlan);

module.exports = router;

