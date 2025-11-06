const express = require('express');
const userController = require('../controllers/userController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

router.use(userController.getCurrentUser);

router
    .route('/config')
    .get(userController.getUserPreferences)
    .put(sanitizeRequestBody, userController.updateUserPreferences);

module.exports = router;

