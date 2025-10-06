const express = require('express');
const reportsController = require('../controllers/reportsController');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .post(
        sanitizeRequestBody,
        reportsController.createReport
    )
    .get(reportsController.getReport)

module.exports = router;
