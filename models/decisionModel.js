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
    }
}, {timestamps: true});


decisionSchema.pre('save', async function (next) {
    try {
        // one day first check for duplicates
        this.slug = slugify(this.title);
    } catch (err) {
        console (err)
    }
    next();
});

const Decision = mongoose.model('Decision', decisionSchema)

module.exports = Decision;