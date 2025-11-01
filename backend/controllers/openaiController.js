const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getCompletion, getEmbeddings } = require('../utils/openai');

/**
 * Example controller showing how to use OpenAI API
 * This follows the same design patterns as other controllers in the app
 */

// Example: Get a completion from OpenAI
exports.getCompletion = catchAsync(async (req, res, next) => {
    const { prompt, model, temperature, max_tokens } = req.body;

    if (!prompt) {
        return next(new AppError('Prompt is required', 400));
    }

    const options = {};
    if (model) options.model = model;
    if (temperature !== undefined) options.temperature = temperature;
    if (max_tokens) options.max_tokens = max_tokens;

    const completion = await getCompletion(prompt, options);

    res.status(200).json({
        status: 'success',
        data: {
            completion
        }
    });
});

// Example: Get embeddings for text
exports.getEmbeddings = catchAsync(async (req, res, next) => {
    const { text, model } = req.body;

    if (!text) {
        return next(new AppError('Text is required', 400));
    }

    const embeddings = await getEmbeddings(text, model);

    res.status(200).json({
        status: 'success',
        data: {
            embeddings: Array.isArray(text) ? embeddings : embeddings[0],
            dimensions: embeddings[0]?.length || 0
        }
    });
});

