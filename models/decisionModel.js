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
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
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
    //TODO add calculated field for status
}, {timestamps: true});

decisionSchema.pre('save', async function (next) {
    
    // ONLY run this function if name was actually modified (or is new)
    if (!this.isModified('title') && !this.isNew) {
        return next();
    }

    // 1. Generate the initial slug
    this.slug = slugify(this.title);

    // 2. Check if this slug already exists and find a unique version
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

    // 3. Assign the final unique slug
    this.slug = uniqueSlug;
    next();
});

const Decision = mongoose.model('Decision', decisionSchema)

module.exports = Decision;