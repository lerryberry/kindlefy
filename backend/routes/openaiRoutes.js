const express = require('express');
const openaiController = require('../controllers/openaiController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

// Example routes for OpenAI functionality
// These can be used directly or you can call the utility functions from other controllers

router
    .route('/completion')
    .post(
        sanitizeRequestBody,
        openaiController.getCompletion
    );

router
    .route('/embeddings')
    .post(
        sanitizeRequestBody,
        openaiController.getEmbeddings
    );

module.exports = router;

