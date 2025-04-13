const { query } = require('express');
const factory = require('./handlerFactory');
const Criteria = require('./../models/criteriaModel')

exports.updateCriterion = factory.updateOne(Criteria);
exports.deleteCriterion = factory.deleteOne(Criteria);
exports.getAllCriteria = factory.getAll(Criteria);
exports.addCriterion = factory.addOne(Criteria);
exports.getCriterion = factory.getOne(Criteria);
