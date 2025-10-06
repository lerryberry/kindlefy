const express = require('express');
const decisionsController = require('../controllers/decisionsController')
const userController = require('../controllers/userController')
const criteriaRouter = require('./criteriaRoutes')
const optionsRouter = require('./optionsRoutes')
const reportsRouter = require('./reportsRoutes')
const { sanitizeRequestBody } = require('../middleware/sanitize')

const router = express.Router();

router.use(userController.getCurrentUser)

router
    .route('/')
    .get(decisionsController.getAllDecisions)
    .post(sanitizeRequestBody, decisionsController.addDecision);
router
    .route('/:id')
    .get(decisionsController.validateDecision, decisionsController.getDecision)
    .put(sanitizeRequestBody, decisionsController.validateDecision, decisionsController.updateDecision)
    .delete(decisionsController.validateDecision, decisionsController.deleteDecision);
router.use('/:decisionId/criteria', criteriaRouter)
router.use('/:decisionId/options', optionsRouter)
router.use('/:decisionId/report', reportsRouter)

module.exports = router;