const express = require('express');
const decisionsController = require('../controllers/decisionsController')
const userController = require('../controllers/userController')
const criteriaRouter = require('./criteriaRoutes')
const optionsRouter = require('./optionsRoutes')

const router = express.Router();

router.use(userController.getCurrentUser)

router
    .route('/')
    .get(decisionsController.getAllDecisions)
    .post(decisionsController.addDecision);
router
    .route('/:id')
    .get(decisionsController.validateDecisionOwner, decisionsController.getDecision)
    .put(decisionsController.validateDecisionOwner, decisionsController.updateDecision)
    .delete(decisionsController.validateDecisionOwner, decisionsController.deleteDecision);

router.use('/:decisionId/criteria', criteriaRouter)
router.use('/:decisionId/options', optionsRouter)

module.exports = router;