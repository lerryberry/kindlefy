const express = require('express');
const decisionsController = require('../controllers/decisionsController')
const criteriaController = require('../controllers/criteriaController')
const rankingRouter = require('./rankingRoutes')

const router = express.Router( {mergeParams: true} );

router
    .route('/')
    .post(criteriaController.addCriterion)
    .get(criteriaController.getAllCriteria)

router
    .route('/:id')
    .get(
        decisionsController.validateDecision,
        criteriaController.validateChildCriterion,
        criteriaController.getCriterion
    )
    .put(
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