const express = require('express');
const rateLimit = require('express-rate-limit');
const userController = require('../controllers/userController');
const placesController = require('../controllers/placesController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

const placesLimiter = rateLimit({
  max: 90,
  windowMs: 60 * 1000,
  message: 'Too many place requests, please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(placesLimiter);
router.use(userController.getCurrentUser);

router.get('/status', placesController.getStatus);
router.post('/autocomplete', sanitizeRequestBody, placesController.autocomplete);
router.post('/resolve', sanitizeRequestBody, placesController.resolvePlace);

module.exports = router;
