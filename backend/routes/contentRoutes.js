const express = require('express');
const userController = require('../controllers/userController');
const contentController = require('../controllers/contentController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

router.use(userController.getCurrentUser);

router
  .route('/')
  .get(contentController.getAllContent)
  .post(sanitizeRequestBody, contentController.createContent);

router
  .route('/:id')
  .get(contentController.getContent)
  .put(sanitizeRequestBody, contentController.updateContent)
  .delete(contentController.deleteContent);

module.exports = router;

