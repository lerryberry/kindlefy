const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    timezone: { type: String, required: [true, 'Schedule timezone is required'], trim: true },
    timeOfDay: {
      type: String,
      required: [true, 'Schedule timeOfDay is required'],
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'timeOfDay must be in HH:mm (24h) format'],
    },
    frequency: { type: String, default: 'daily', trim: true },
  },
  { _id: false }
);

const deliveryPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A delivery plan must belong to a user'],
      index: true,
    },
    deliveryTarget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryTarget',
      required: [true, 'A delivery plan must have a delivery target'],
      index: true,
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: [true, 'A delivery plan must have content'],
      index: true,
    },
    schedule: { type: scheduleSchema, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deliveryPlanSchema.index(
  { user: 1, deliveryTarget: 1, content: 1, 'schedule.timeOfDay': 1, 'schedule.frequency': 1 },
  { unique: true }
);

module.exports = mongoose.model('DeliveryPlan', deliveryPlanSchema);

