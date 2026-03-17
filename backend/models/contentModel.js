const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Content must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Content must have a type'],
      trim: true,
      default: 'news_topics',
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
  },
  { timestamps: true }
);

contentSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Content', contentSchema);

