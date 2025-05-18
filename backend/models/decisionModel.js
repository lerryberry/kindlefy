const slugify = require('slugify');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const decisionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A decision must have a title'],
        minlength: [10, 'A decision title must have more than 9 characters'],
        maxlength: [201, 'A decision title must be 200 character or less']
    },
    accessControl: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        permissions: [{ type: String, enum: ['READ', 'UPDATE', 'DELETE', 'RANK'] }]
    }],
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
}, {timestamps: true});

decisionSchema.pre('save', async function (next) {
    
    // run this function if name was actually modified (or is new)
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
    while (await Model.findOne({ slug: uniqueSlug})) {
        // If it exists, append a counter
        uniqueSlug = `${this.slug}-${counter}`;
        counter++;
    }

    // Assign the final unique slug
    this.slug = uniqueSlug;
    next();
});

const Decision = mongoose.model('Decision', decisionSchema)

module.exports = Decision;