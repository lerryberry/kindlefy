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
const decisionRouter = require('./routes/decisionRoutes');

//middleware to start express
const app = express();

console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE);
console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);

// Enable CORS for frontend - must be before auth middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Auth0 configuration
console.log('Auth0 Config Debug:');
console.log('AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE);
console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
console.log('AUTH0_AUDIENCE type:', typeof process.env.AUTH0_AUDIENCE);
console.log('AUTH0_AUDIENCE length:', process.env.AUTH0_AUDIENCE?.length);

const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_DOMAIN,
    tokenSigningAlg: 'RS256',
});

// Apply Auth0 middleware to API routes only (not static files)
app.use('/api', (req, res, next) => {
    console.log('API Request Debug:');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Authorization header exists:', !!req.headers.authorization);
    console.log('Authorization header length:', req.headers.authorization?.length);

    // Call the Auth0 middleware
    jwtCheck(req, res, next);
});

//security HTTP headers with CSP configured for Auth0
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: [
                "'self'",
                "https://dev-d85syd7wejqy2nrm.us.auth0.com",
                "https://krystallise-469a37509070.herokuapp.com"
            ],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

//global middlewares.. if dev env, make logging verbose
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log("Morgan in development mode")
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
app.use('/api/v1/decisions', decisionRouter);

// Serve static files from the frontend build
const staticPath = path.join(__dirname, '../frontend/dist');
console.log('Static files path:', staticPath);
console.log('Path exists:', require('fs').existsSync(staticPath));
app.use(express.static(staticPath));

// For SPA: serve index.html for any unknown route (after your API routes)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    console.log('Serving index.html from:', indexPath);
    console.log('Index file exists:', require('fs').existsSync(indexPath));
    res.sendFile(indexPath);
});

//catch unhandles routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;