const mongoose = require('mongoose');

const localisationSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ['global', 'country', 'local', 'special'],
      default: 'global',
    },
    text: {
      type: String,
      default: null,
      maxlength: [500, 'Address must be 500 characters or less'],
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    timezone: {
      type: String,
      default: null,
    },
    promptText: {
      type: String,
      default: 'globally',
    },
  },
  { _id: false }
);

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
      type: Number,
      required: [true, 'A prompt must have a target word count'],
      min: [500, 'Word count must be at least 500'],
      max: [5000, 'Word count must be at most 5000'],
    },
    topics: {
      type: [String],
      default: [],
    },
    localisation: {
      type: localisationSchema,
      default: () => ({
        scope: 'global',
        text: null,
        coordinates: { lat: null, lng: null },
        timezone: null,
        promptText: 'globally',
      }),
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
