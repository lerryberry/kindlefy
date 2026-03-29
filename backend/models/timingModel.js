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

const timingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A timing must belong to a user'],
      index: true,
    },
    prompt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
      index: true,
    },
    /** Legacy documents may only have this ref to the same collection as `prompt`. */
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
      index: true,
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

timingSchema.index({ user: 1, isArchived: 1 });
timingSchema.index({ user: 1, prompt: 1 });
timingSchema.index({ user: 1, content: 1 });

module.exports = mongoose.model('Timing', timingSchema, 'timings');
