const mongoose = require('mongoose');

/**
 * Shared Kindle destination; many timings can reference the same target (populate sees one document).
 */
const targetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A target must belong to a user'],
      index: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: [80, 'Label must be 80 characters or less'],
    },
    kindleEmail: {
      type: String,
      required: [true, 'A target must have a Kindle email'],
      lowercase: true,
      trim: true,
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

targetSchema.index(
  { user: 1, kindleEmail: 1 },
  { unique: true, partialFilterExpression: { isArchived: { $ne: true } } }
);

module.exports = mongoose.model('Target', targetSchema, 'deliverytargets');
