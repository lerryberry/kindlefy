const mongoose = require('mongoose');

const deliveryTargetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A delivery target must belong to a user'],
      index: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: [80, 'Label must be 80 characters or less'],
    },
    kindleEmail: {
      type: String,
      required: [true, 'A delivery target must have a Kindle email'],
      lowercase: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

deliveryTargetSchema.index({ user: 1, kindleEmail: 1 }, { unique: true });

module.exports = mongoose.model('DeliveryTarget', deliveryTargetSchema);

