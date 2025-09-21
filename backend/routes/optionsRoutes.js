const express = require('express');
const decisionsController = require('../controllers/decisionsController')
const optionsController = require('../controllers/optionsController')

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .post(optionsController.addManyOptions)
    .get(optionsController.getAllOptions)

router
    .route('/:id')
    .get(
        decisionsController.validateDecision,
        optionsController.validateChildOption,
        optionsController.getOption
    )
    .put(
        decisionsController.validateDecision,
        optionsController.validateChildOption,
        optionsController.updateOption
    )
    .delete(
        decisionsController.validateDecision,
        optionsController.validateChildOption,
        optionsController.deleteOption
    )

module.exports = router;