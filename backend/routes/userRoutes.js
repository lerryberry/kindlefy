const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(userController.getCurrentUser);

router
    .route('/me')
    .get(userController.getMe);

module.exports = router;

