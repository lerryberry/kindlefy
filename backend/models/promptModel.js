const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A prompt must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'A prompt must have a type'],
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [120, 'Name must be 120 characters or less'],
    },
    topics: {
      type: [String],
      default: [],
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

promptSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Prompt', promptSchema, 'contents');
