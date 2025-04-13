const express = require('express');
const criteriaController = require('../controllers/criteriaController')
const decisionsController = require('../controllers/decisionsController')

const router = express.Router( {mergeParams: true} );

router
    .route('/')
    .post(criteriaController.addCriterion)
    .get(criteriaController.getAllCriteria)

router
    .route('/:id')
    .get(decisionsController.validateDecisionOwner, criteriaController.getCriterion)
    .put(decisionsController.validateDecisionOwner,criteriaController.updateCriterion)
    .delete(decisionsController.validateDecisionOwner, criteriaController.deleteCriterion)

module.exports = router;