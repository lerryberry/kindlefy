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
    // Trim whitespace
    return stripped.trim();
};

// Middleware to sanitize all text fields in request body
const sanitizeRequestBody = (req, res, next) => {
    if (req.body) {
        // Sanitize all string fields in the request body
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
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
