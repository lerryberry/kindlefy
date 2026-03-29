const express = require('express');
const userController = require('../controllers/userController');
const promptController = require('../controllers/promptController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

router.use(userController.getCurrentUser);

router
  .route('/')
  .get(promptController.getAllPrompts)
  .post(sanitizeRequestBody, promptController.createPrompt);

router
  .route('/:id')
  .get(promptController.getPrompt)
  .put(sanitizeRequestBody, promptController.updatePrompt)
  .delete(promptController.deletePrompt);

module.exports = router;
