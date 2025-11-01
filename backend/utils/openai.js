const AppError = require('./appError');
const OpenAI = require('openai');

// Lazy initialization of OpenAI client to ensure env vars are loaded
let openai = null;

const getOpenAIClient = () => {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new AppError('OpenAI API key is not configured', 500);
        }
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
};

/**
 * Make a completion request to OpenAI
 * @param {string} prompt - The prompt to send to OpenAI
 * @param {object} options - Optional configuration (model, temperature, max_tokens, etc.)
 * @returns {Promise<string>} - The completion text
 */
const getCompletion = async (prompt, options = {}) => {
    if (!process.env.OPENAI_API_KEY) {
        throw new AppError('OpenAI API key is not configured', 500);
    }

    const {
        model = 'gpt-4o-mini',
        temperature = 0.7,
        max_tokens = 1000,
        ...otherOptions
    } = options;

    try {
        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature,
            max_tokens,
            ...otherOptions
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
            throw new AppError('No response content from OpenAI', 500);
        }

        return content;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        // Handle OpenAI-specific errors
        if (error.status === 401) {
            throw new AppError('Invalid OpenAI API key', 401);
        } else if (error.status === 429) {
            throw new AppError('OpenAI API rate limit exceeded', 429);
        } else if (error.status >= 500) {
            throw new AppError('OpenAI API service error', 502);
        }

        throw new AppError(error.message || 'Error calling OpenAI API', 500);
    }
};

/**
 * Make a streaming completion request to OpenAI
 * @param {string} prompt - The prompt to send to OpenAI
 * @param {object} options - Optional configuration
 * @returns {AsyncIterable} - Streaming response
 */
const getStreamingCompletion = async function* (prompt, options = {}) {
    if (!process.env.OPENAI_API_KEY) {
        throw new AppError('OpenAI API key is not configured', 500);
    }

    const {
        model = 'gpt-4o-mini',
        temperature = 0.7,
        max_tokens = 1000,
        ...otherOptions
    } = options;

    try {
        const client = getOpenAIClient();
        const stream = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature,
            max_tokens,
            stream: true,
            ...otherOptions
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        if (error.status === 401) {
            throw new AppError('Invalid OpenAI API key', 401);
        } else if (error.status === 429) {
            throw new AppError('OpenAI API rate limit exceeded', 429);
        } else if (error.status >= 500) {
            throw new AppError('OpenAI API service error', 502);
        }

        throw new AppError(error.message || 'Error calling OpenAI API', 500);
    }
};

/**
 * Generate embeddings for text
 * @param {string|string[]} input - Text or array of texts to generate embeddings for
 * @param {string} model - Embedding model to use (default: 'text-embedding-3-small')
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
const getEmbeddings = async (input, model = 'text-embedding-3-small') => {
    if (!process.env.OPENAI_API_KEY) {
        throw new AppError('OpenAI API key is not configured', 500);
    }

    try {
        const client = getOpenAIClient();
        const response = await client.embeddings.create({
            model,
            input: Array.isArray(input) ? input : [input],
        });

        return response.data.map(item => item.embedding);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        if (error.status === 401) {
            throw new AppError('Invalid OpenAI API key', 401);
        } else if (error.status === 429) {
            throw new AppError('OpenAI API rate limit exceeded', 429);
        } else if (error.status >= 500) {
            throw new AppError('OpenAI API service error', 502);
        }

        throw new AppError(error.message || 'Error calling OpenAI API', 500);
    }
};

module.exports = {
    getCompletion,
    getStreamingCompletion,
    getEmbeddings,
    getOpenAIClient // Export for advanced usage if needed
};

