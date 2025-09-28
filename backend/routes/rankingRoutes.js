const express = require('express');
const decisionsController = require('../controllers/decisionsController')
const rankingController = require('../controllers/rankingController')
const criteriaController = require('../controllers/criteriaController')
const optionsController = require('../controllers/optionsController')
const { sanitizeRequestBody } = require('../middleware/sanitize')

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .post(
        sanitizeRequestBody,
        decisionsController.validateDecision,
        criteriaController.validateChildCriterion,
        rankingController.updateRanking
    )
    .get(
        decisionsController.validateDecision,
        criteriaController.validateChildCriterion,
        optionsController.getRankedOptions
    )

module.exports = router;