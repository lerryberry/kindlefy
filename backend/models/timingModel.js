const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    timezone: { type: String, required: [true, 'Schedule timezone is required'], trim: true },
    timeOfDay: {
      type: String,
      required: [true, 'Schedule timeOfDay is required'],
      trim: true,
      match: [/^([01]\d|2[0-3]):(00|30)$/, 'timeOfDay must be in HH:mm with minutes 00 or 30'],
    },
    frequency: { type: String, default: 'daily', trim: true },
  },
  { _id: false }
);

const timingSchema = new mongoose.Schema(
  {
    digest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Digest',
      required: [true, 'A timing must belong to a digest'],
      // Indexed via `timingSchema.index({ digest: 1, ... })` to avoid duplicate index warnings.
    },
    schedule: { type: scheduleSchema, required: true },
    targets: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Target' }],
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

timingSchema.index({ digest: 1, isArchived: 1 });

module.exports = mongoose.model('Timing', timingSchema, 'timings');
