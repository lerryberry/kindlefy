const express = require('express');
const decisionsController = require('../controllers/decisionsController')
const criteriaController = require('../controllers/criteriaController')
const rankingRouter = require('./rankingRoutes')
const { sanitizeRequestBody } = require('../middleware/sanitize')

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .post(sanitizeRequestBody, criteriaController.addManyCriterias)
    .get(criteriaController.getAllCriteria)

router
    .route('/rankings')
    .put(
        sanitizeRequestBody,
        decisionsController.validateDecision,
        criteriaController.updateManyCriterias
    )


router
    .route('/:id')
    .get(
        decisionsController.validateDecision,
        criteriaController.validateChildCriterion,
        criteriaController.getCriterion
    )
    .put(
        sanitizeRequestBody,
        decisionsController.validateDecision,
        criteriaController.validateChildCriterion,
        criteriaController.updateCriterion
    )
    .delete(
        decisionsController.validateDecision,
        criteriaController.validateChildCriterion,
        criteriaController.deleteCriterion
    )

router.use('/:id/ranking', rankingRouter)

module.exports = router;