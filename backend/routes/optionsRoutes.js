const express = require('express');
const decisionsController = require('../controllers/decisionsController')
const optionsController = require('../controllers/optionsController')
const { sanitizeRequestBody } = require('../middleware/sanitize')

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .post(sanitizeRequestBody, optionsController.addManyOptions)
    .get(optionsController.getAllOptions)

router
    .route('/:id')
    .get(
        decisionsController.validateDecision,
        optionsController.validateChildOption,
        optionsController.getOption
    )
    .put(
        sanitizeRequestBody,
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