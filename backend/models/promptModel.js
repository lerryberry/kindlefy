const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A prompt must belong to a user'],
      index: true,
    },
    length: {
      type: String,
      required: [true, 'A prompt must have a length'],
      enum: ['short', 'medium', 'long'],
    },
    topics: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

promptSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model('Prompt', promptSchema, 'prompts');
