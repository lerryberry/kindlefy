const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const validator = require('validator');

// Create a DOM environment for DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Strict sanitization function - strips ALL HTML/code, only allows plain text
const sanitizeText = (input) => {
    if (typeof input !== 'string') return input;

    // First escape HTML entities
    const escaped = validator.escape(input);
    // Then strip ALL HTML tags (including safe ones)
    const stripped = DOMPurify.sanitize(escaped, { ALLOWED_TAGS: [] });

    // Restore commonly needed characters after sanitization
    const restored = stripped
        .replace(/&amp;/g, '&')           // Ampersand
        .replace(/&quot;/g, '"')          // Double quote
        .replace(/&#x27;/g, "'")          // Apostrophe
        .replace(/&#x2F;/g, '/')          // Forward slash
        .replace(/&#96;/g, '`');          // Backtick

    // Trim whitespace
    return restored.trim();
};

// Middleware to sanitize all text fields in request body
const sanitizeRequestBody = (req, res, next) => {
    if (req.body) {


        // Sanitize all string fields in the request body
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                const originalValue = req.body[key];
                req.body[key] = sanitizeText(req.body[key]);


            }
        });
    }
    next();
};

module.exports = {
    sanitizeText,
    sanitizeRequestBody
};
