const express = require('express');
const userController = require('../controllers/userController');
const targetController = require('../controllers/targetController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

router.use(userController.getCurrentUser);

router
  .route('/')
  .get(targetController.getAllTargets)
  .post(sanitizeRequestBody, targetController.createTarget);

router
  .route('/:id')
  .get(targetController.getTarget)
  .put(sanitizeRequestBody, targetController.updateTarget)
  .delete(targetController.deleteTarget);

module.exports = router;
