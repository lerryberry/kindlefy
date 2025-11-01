/**
 * Example usage of OpenAI utility functions
 * This file demonstrates how to use OpenAI in your controllers following the app's design patterns
 */

const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const { getCompletion, getEmbeddings, getStreamingCompletion } = require('./openai');

// Example 1: Using getCompletion in a controller
exports.exampleGetCompletion = catchAsync(async (req, res, next) => {
    const { prompt } = req.body;

    if (!prompt) {
        return next(new AppError('Prompt is required', 400));
    }

    // Simple usage with default options
    const completion = await getCompletion(prompt);

    // Or with custom options
    const customCompletion = await getCompletion(prompt, {
        model: 'gpt-4o',
        temperature: 0.9,
        max_tokens: 2000
    });

    res.status(200).json({
        status: 'success',
        data: { completion }
    });
});

// Example 2: Using getEmbeddings
exports.exampleGetEmbeddings = catchAsync(async (req, res, next) => {
    const { text } = req.body;

    // For single text
    const embeddings = await getEmbeddings(text);

    // For multiple texts (returns array of embeddings)
    const multipleEmbeddings = await getEmbeddings(['text1', 'text2', 'text3']);

    res.status(200).json({
        status: 'success',
        data: { embeddings }
    });
});

// Example 3: Using streaming (for Server-Sent Events)
exports.exampleStreaming = catchAsync(async (req, res, next) => {
    const { prompt } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        for await (const chunk of getStreamingCompletion(prompt)) {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

/**
 * Design Patterns Used:
 * 
 * 1. Error Handling: Uses AppError class (same as auth0.js middleware)
 * 2. Environment Variables: Reads OPENAI_API_KEY from process.env
 * 3. Async/Await: All functions are async
 * 4. Controller Pattern: Wrap utility calls in catchAsync in controllers
 * 5. Consistent Response Format: Returns standard JSON responses
 */

