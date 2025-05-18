const express = require('express');
const decisionsController = require('../controllers/decisionsController')
const rankingController = require('../controllers/rankingController')
const criteriaController = require('../controllers/criteriaController')
const optionsController = require('../controllers/optionsController')

const router = express.Router( {mergeParams: true} );

router
    .route('/')
    .post(
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