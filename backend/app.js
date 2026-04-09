const express = require('express');
const morgan = require('morgan');
const { auth, RequiredAuthProp } = require('express-oauth2-jwt-bearer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

//import controllers
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const promptRouter = require('./routes/promptRoutes');
const targetRouter = require('./routes/targetRoutes');
const timingRouter = require('./routes/timingRoutes');
const digestRouter = require('./routes/digestRoutes');
const placesRouter = require('./routes/placesRoutes');

//middleware to start express
const app = express();

// Trust proxy for x-forwarded-proto header (important for Heroku and other proxies)
app.set('trust proxy', 1);

// Enable CORS for frontend - must be before auth middleware
// Support multiple origins (comma-separated string or array)
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : process.env.CORS_ORIGIN;

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Force SSL in production - check x-forwarded-proto header
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        // Check if the request is coming through a proxy (Heroku, etc.)
        if (req.headers['x-forwarded-proto'] !== 'https') {
            // Redirect to HTTPS version
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });
}

// Auth0 configuration - support multiple Auth0 domains
// Parse multiple domains from environment variable (comma-separated)
const auth0Domains = process.env.AUTH0_DOMAIN
    ? process.env.AUTH0_DOMAIN.split(',').map(domain => domain.trim())
    : [process.env.AUTH0_DOMAIN];

// Use the first domain as the primary issuer, but validate against all
// express-oauth2-jwt-bearer validates the issuer claim against issuerBaseURL
const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: auth0Domains[0] || process.env.AUTH0_DOMAIN,
    tokenSigningAlg: 'RS256',
});

// Apply Auth0 middleware to API routes only (not static files)
app.use('/api', jwtCheck);

//security HTTP headers with CSP configured for Auth0
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: [
                "'self'",
                // Allow the Auth0 tenant for token/iframe calls (silent auth, etc.)
                ...auth0Domains,
                // Allow your analytics endpoint
                "https://*.posthog.com"
            ],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://*.posthog.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: [
                "'self'",
                // Allow Auth0 tenant in hidden iframes for silent auth
                ...auth0Domains
            ]
        }
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    // Additional security headers
    noSniff: true,
    ieNoOpen: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

//global middlewares.. if dev env, make logging verbose
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));

}

//rate limiter
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use(limiter);

//security, sanitisation and other middlewares
app.use(express.json({ limit: '10kb' })); // limit to 10kb
app.use(mongosanitize()); //sanitize data against NoSQL query injection
app.use(xss()); //sanitize data against XSS attacks
app.use(hpp({ //prevent parameter pollution
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity']
}));
app.use(cookieParser()); //parse cookies
app.use(compression()); //compress response bodies for all requests

//parse urlencoded data
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // limit to 10kb
app.use(express.json());

// Apply routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/prompts', promptRouter);
app.use('/api/v1/targets', targetRouter);
app.use('/api/v1/timings', timingRouter);
app.use('/api/v1/digests', digestRouter);
app.use('/api/v1/places', placesRouter);


// Serve static files from the frontend build
const staticPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(staticPath));

// For SPA: serve index.html for any unknown route (after your API routes)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');

    res.sendFile(indexPath);
});

//catch unhandles routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;