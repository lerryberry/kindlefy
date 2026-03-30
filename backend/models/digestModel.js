const mongoose = require('mongoose');

const digestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A digest must belong to a user'],
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

digestSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model('Digest', digestSchema, 'digests');

