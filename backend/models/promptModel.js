const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema(
  {
    digest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Digest',
      required: [true, 'A prompt must belong to a digest'],
      index: true,
    },
    order: {
      type: Number,
      required: [true, 'A prompt must have an order'],
      min: [0, 'Order must be >= 0'],
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

promptSchema.index({ digest: 1, order: 1, isArchived: 1 });

module.exports = mongoose.model('Prompt', promptSchema, 'prompts');
