const slugify = require('slugify');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const optionsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'An option must have a title'],
        minlength: [3, 'An option title must have more than 2 characters'],
        maxlength: [201, 'An option title must be 200 character or less']
    },
    parentDecision: {
        type: Schema.Types.ObjectId,
        ref: 'Decision',
        required: true
    },
    description: {
        type: String,
        minlength: [10, 'An option description must have more than 9 characters'],
        maxlength: [1001, 'An option title must be 1000 character or less']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    isArchived: {
        type: Boolean,
        default: false,
        required: true,
    }
}, { timestamps: true })

// Indexes for common query patterns
optionsSchema.index({ parentDecision: 1, isArchived: 1 });

optionsSchema.pre('save', async function (next) {

    // ONLY run this function if name was actually modified (or is new)
    if (!this.isModified('title') && !this.isNew) {
        return next();
    }

    // Generate the initial slug
    this.slug = slugify(this.title);

    // Check if this slug already exists and find a unique version
    const Model = this.constructor; // Get the Mongoose model
    let counter = 1;
    let uniqueSlug = this.slug;

    // Loop while a document with the current candidate slug exists
    // Make sure to exclude the current document if it's an update (`this._id`)
    while (await Model.findOne({ slug: uniqueSlug })) {
        // If it exists, append a counter
        uniqueSlug = `${this.slug}-${counter}`;
        counter++;
    }

    // Assign the final unique slug
    this.slug = uniqueSlug;
    next();
});

const Options = mongoose.model('Options', optionsSchema)

module.exports = Options;