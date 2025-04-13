const express = require('express');
const optionsController = require('../controllers/optionsController')
const decisionsController = require('../controllers/decisionsController')

const router = express.Router( {mergeParams: true} );

router
    .route('/')
    .post(optionsController.addOption)
    .get(optionsController.getAllOptions)

router
    .route('/:id')
    .get(decisionsController.validateDecisionOwner, optionsController.getOption)
    .put(decisionsController.validateDecisionOwner,optionsController.updateOption)
    .delete(decisionsController.validateDecisionOwner, optionsController.deleteOption)

module.exports = router;