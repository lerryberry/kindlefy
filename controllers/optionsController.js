const { query } = require('express');
const factory = require('./handlerFactory');
const Option = require('./../models/optionsModel.js')

exports.updateOption = factory.updateOne(Option);
exports.deleteOption = factory.deleteOne(Option);
exports.getAllOptions = factory.getAll(Option);
exports.addOption = factory.addOne(Option);
exports.getOption = factory.getOne(Option);
